Read AGENTS.md first and follow it strictly.

Implement only the bottom tab navigation based on the attached design. Create the tab routes for Home, Learn, AI Teacher, Chat, and Profile with simple placeholder screens for now.

**Route structure:**
- `/` → Home tab (default route, maps to root)
- `/learn` → Learn tab with lesson list
  - `/learn/[id]` → Individual lesson detail (opens from Learn, back returns to /learn)
- `/ai-teacher` → AI Teacher tab
- `/chat` → Chat tab
- `/profile` → Profile tab

Use Expo Router's (tabs) group pattern with Bottom Tab Navigator. Ensure lesson navigation stays scoped within the Learn tab so selecting a lesson doesn't switch tabs.

Build a custom tab bar with an active circular indicator for the selected tab. The active tab should appear inside a colored circle showing only the icon (no label), while inactive tabs should show both icon and label. Add a smooth animated transition for the active circle moving between tabs.

**Accessibility requirements:**
- Each tab must have an accessible name (from its label) even when visually hidden
- Set `accessibilityRole="tab"` on tab buttons
- Set `accessibilityState={{ selected: isActive }}` to report tab selection state
- Test with VoiceOver (iOS) and TalkBack (Android) to verify both active and inactive tabs are properly announced

Do not implement the Home screen UI yet.

@prompt_material/05-home-and-tab-navigation.png