# demo.tape — VHS script for GigOps terminal demo GIF
# Install: https://github.com/charmbracelet/vhs
# Run:     vhs demo/demo.tape

Output demo/gigops-demo.gif

Set Shell "bash"
Set FontSize 14
Set Width 900
Set Height 550
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 40ms
Set PlaybackSpeed 1

# Run the mock output script which handles all typing simulation
Type "bash demo/mock-output.sh"
Enter
Sleep 90s
