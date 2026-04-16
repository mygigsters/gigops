// GigOps Dashboard — Terminal UI
// A bubbletea TUI for browsing and managing your gig pipeline.
//
// Usage: go run main.go [--pipeline ../pipeline/pipeline.jsonl]
package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/lipgloss"
)

// PipelineEntry mirrors the TypeScript PipelineEntry type
type PipelineEntry struct {
	ID              string  `json:"id"`
	URL             string  `json:"url"`
	Platform        string  `json:"platform"`
	Title           string  `json:"title"`
	BudgetRaw       string  `json:"budget_raw"`
	Status          string  `json:"status"`
	Score           float64 `json:"score"`
	Grade           string  `json:"grade"`
	ProposalSent    bool    `json:"proposal_sent"`
	ProposalSentAt  string  `json:"proposal_sent_at,omitempty"`
	Response        string  `json:"response,omitempty"`
	Notes           string  `json:"notes,omitempty"`
	DiscoveredAt    string  `json:"discovered_at"`
	UpdatedAt       string  `json:"updated_at"`
}

// Styles
var (
	titleStyle = lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("#7C3AED")).
		PaddingLeft(2)

	subtitleStyle = lipgloss.NewStyle().
		Foreground(lipgloss.Color("#6B7280")).
		PaddingLeft(2)

	statusStyles = map[string]lipgloss.Style{
		"won":              lipgloss.NewStyle().Foreground(lipgloss.Color("#10B981")).Bold(true),
		"applied":          lipgloss.NewStyle().Foreground(lipgloss.Color("#3B82F6")),
		"interviewing":     lipgloss.NewStyle().Foreground(lipgloss.Color("#F59E0B")),
		"evaluated":        lipgloss.NewStyle().Foreground(lipgloss.Color("#8B5CF6")),
		"discovered":       lipgloss.NewStyle().Foreground(lipgloss.Color("#6B7280")),
		"skipped":          lipgloss.NewStyle().Foreground(lipgloss.Color("#374151")),
		"lost":             lipgloss.NewStyle().Foreground(lipgloss.Color("#EF4444")),
		"proposal_drafted": lipgloss.NewStyle().Foreground(lipgloss.Color("#06B6D4")),
	}

	gradeStyles = map[string]lipgloss.Style{
		"A": lipgloss.NewStyle().Foreground(lipgloss.Color("#10B981")).Bold(true),
		"B": lipgloss.NewStyle().Foreground(lipgloss.Color("#3B82F6")).Bold(true),
		"C": lipgloss.NewStyle().Foreground(lipgloss.Color("#F59E0B")),
		"D": lipgloss.NewStyle().Foreground(lipgloss.Color("#EF4444")),
		"F": lipgloss.NewStyle().Foreground(lipgloss.Color("#EF4444")).Bold(true),
	}

	helpStyle = lipgloss.NewStyle().
		Foreground(lipgloss.Color("#4B5563")).
		PaddingLeft(2)

	detailStyle = lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#7C3AED")).
		Padding(1, 2).
		MarginLeft(2)
)

type model struct {
	entries      []PipelineEntry
	table        table.Model
	selected     *PipelineEntry
	filterStatus string
	width        int
	height       int
	showDetail   bool
	message      string
}

type loadMsg struct{ entries []PipelineEntry }
type errMsg struct{ err error }

func loadPipeline(path string) tea.Cmd {
	return func() tea.Msg {
		f, err := os.Open(path)
		if err != nil {
			// Return empty if not found
			return loadMsg{entries: []PipelineEntry{}}
		}
		defer f.Close()

		var entries []PipelineEntry
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" {
				continue
			}
			var entry PipelineEntry
			if err := json.Unmarshal([]byte(line), &entry); err == nil {
				entries = append(entries, entry)
			}
		}
		return loadMsg{entries: entries}
	}
}

func newTable(entries []PipelineEntry) table.Model {
	columns := []table.Column{
		{Title: "Grade", Width: 6},
		{Title: "Title", Width: 40},
		{Title: "Platform", Width: 12},
		{Title: "Budget", Width: 14},
		{Title: "Status", Width: 16},
		{Title: "Updated", Width: 12},
	}

	rows := make([]table.Row, 0, len(entries))
	for _, e := range entries {
		updated := ""
		if e.UpdatedAt != "" {
			if t, err := time.Parse(time.RFC3339, e.UpdatedAt); err == nil {
				updated = t.Format("Jan 02")
			}
		}
		title := e.Title
		if len(title) > 38 {
			title = title[:38] + "…"
		}
		rows = append(rows, table.Row{
			e.Grade,
			title,
			e.Platform,
			e.BudgetRaw,
			e.Status,
			updated,
		})
	}

	t := table.New(
		table.WithColumns(columns),
		table.WithRows(rows),
		table.WithFocused(true),
		table.WithHeight(20),
	)

	s := table.DefaultStyles()
	s.Header = s.Header.
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("#7C3AED")).
		BorderBottom(true).
		Bold(true)
	s.Selected = s.Selected.
		Foreground(lipgloss.Color("#FFFFFF")).
		Background(lipgloss.Color("#7C3AED")).
		Bold(true)
	t.SetStyles(s)

	return t
}

func initialModel(pipelinePath string) model {
	t := newTable([]PipelineEntry{})
	return model{
		table:   t,
		message: "Loading pipeline...",
	}
}

func (m model) Init() tea.Cmd {
	pipelinePath := "../pipeline/pipeline.jsonl"
	if envPath := os.Getenv("PIPELINE_FILE"); envPath != "" {
		pipelinePath = envPath
	}
	return loadPipeline(pipelinePath)
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case loadMsg:
		m.entries = msg.entries
		m.table = newTable(m.entries)
		stats := computeStats(m.entries)
		m.message = fmt.Sprintf("Total: %d | Applied: %d | Won: %d | Avg Score: %.1f",
			stats.total, stats.applied, stats.won, stats.avgScore)
		return m, nil

	case errMsg:
		m.message = "Error: " + msg.err.Error()
		return m, nil

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "enter":
			if len(m.entries) > 0 {
				idx := m.table.Cursor()
				if idx < len(m.entries) {
					m.selected = &m.entries[idx]
					m.showDetail = true
				}
			}
		case "esc":
			m.showDetail = false
			m.selected = nil
		case "r":
			m.message = "Reloading..."
			m.showDetail = false
			pipelinePath := "../pipeline/pipeline.jsonl"
			return m, loadPipeline(pipelinePath)
		}
	}

	var cmd tea.Cmd
	m.table, cmd = m.table.Update(msg)
	return m, cmd
}

func (m model) View() string {
	var sb strings.Builder

	// Header
	sb.WriteString("\n")
	sb.WriteString(titleStyle.Render("⚡ GigOps Dashboard"))
	sb.WriteString("\n")
	sb.WriteString(subtitleStyle.Render("AI-powered gig pipeline — by MyGigsters"))
	sb.WriteString("\n\n")

	if m.showDetail && m.selected != nil {
		// Detail view
		e := m.selected
		gradeStyle := gradeStyles[e.Grade]
		statusStyle := statusStyles[e.Status]
		if _, ok := statusStyles[e.Status]; !ok {
			statusStyle = lipgloss.NewStyle()
		}

		detail := fmt.Sprintf(
			"%s\n%s\n\nGrade: %s  Score: %.1f/5\nStatus: %s\nPlatform: %s\nBudget: %s\n\nURL: %s",
			lipgloss.NewStyle().Bold(true).Render(e.Title),
			lipgloss.NewStyle().Foreground(lipgloss.Color("#6B7280")).Render(e.ID),
			gradeStyle.Render(e.Grade),
			e.Score,
			statusStyle.Render(e.Status),
			e.Platform,
			e.BudgetRaw,
			lipgloss.NewStyle().Foreground(lipgloss.Color("#3B82F6")).Render(e.URL),
		)
		if e.Notes != "" {
			detail += "\n\nNotes: " + e.Notes
		}
		sb.WriteString(detailStyle.Render(detail))
		sb.WriteString("\n\n")
		sb.WriteString(helpStyle.Render("ESC back • q quit"))
	} else {
		// Table view
		sb.WriteString(m.table.View())
		sb.WriteString("\n\n")
		sb.WriteString(subtitleStyle.Render(m.message))
		sb.WriteString("\n")
		sb.WriteString(helpStyle.Render("↑↓ navigate • enter detail • r reload • q quit"))
	}

	return sb.String()
}

type stats struct {
	total    int
	applied  int
	won      int
	avgScore float64
}

func computeStats(entries []PipelineEntry) stats {
	s := stats{total: len(entries)}
	var scoreSum float64
	var scoreCount int
	for _, e := range entries {
		if e.Status == "applied" || e.Status == "interviewing" {
			s.applied++
		}
		if e.Status == "won" {
			s.won++
		}
		if e.Score > 0 {
			scoreSum += e.Score
			scoreCount++
		}
	}
	if scoreCount > 0 {
		s.avgScore = scoreSum / float64(scoreCount)
	}
	return s
}

func main() {
	pipelinePath := flag.String("pipeline", "../pipeline/pipeline.jsonl", "Path to pipeline.jsonl")
	flag.Parse()

	if envPath := os.Getenv("PIPELINE_FILE"); envPath != "" {
		*pipelinePath = envPath
	}

	os.Setenv("PIPELINE_FILE", *pipelinePath)

	p := tea.NewProgram(initialModel(*pipelinePath), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
