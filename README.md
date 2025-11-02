# ADHD Corkboard

A neobrutalist-styled digital corkboard designed to help individuals with ADHD visualize, organize, and connect their thoughts and tasks.

The application provides an infinite, zoomable canvas with pre-defined zones to help structure ideas from a "Brain Dump" area into actionable "Tasks", things to do "Now", and finally to "Done".

![ADHD Corkboard Screenshot](https://i.imgur.com/your-screenshot.png) 
*(Screenshot placeholder: A visual of the corkboard with several colored notes in different zones, connected by lines, showcasing the neobrutalist UI.)*

## ✨ Core Features

- **Infinite Canvas**: A large, zoomable, and pannable workspace that gives you endless room for your ideas.
- **Structured Zones**: Four distinct zones (`Brain Dump`, `Tasks`, `Now`, `Done`) to guide the process of organizing thoughts.
- **Draggable Notes**: Easily add, edit, and drag notes anywhere on the canvas.
- **Visual Connections**: Create lines between notes to represent relationships, dependencies, or flows.
- **Dynamic Note Sizing**: Notes automatically resize based on the number of other notes in their zone, reducing visual clutter and encouraging focus.
- **Neobrutalist UI**: A bold, high-contrast design with solid colors, strong borders, and hard shadows for clarity and reduced visual noise.
- **Full Customization**: Use the side panel to change the color of the board, the default note color, and the connection lines to fit your personal style.
- **Persistent State**: Your entire board—notes, connections, and color settings—is automatically saved to your browser's local storage.
- **Full Touch Support**: Intuitive touch controls for panning (one finger), zooming (pinch), and dragging notes on mobile and tablet devices.

## 🚀 How to Use

- **Adding a Note**: Click the **"Add Note"** button in the top-left corner. New notes always appear in the "Brain Dump" zone.
- **Editing a Note**: Double-click any note to edit its content. Click outside the note to save.
- **Moving a Note**: Click and drag a note. If you drag it near the edge of the screen, the canvas will automatically pan.
- **Connecting Notes**:
    1. Click the **link icon** on a note to start a connection.
    2. Click another note to complete the link.
    3. Press `ESC` to cancel.
- **Deleting a Note**: Click the **trash icon** on a note.
- **Navigating the Canvas**:
    - **Pan**: Click and drag with the **middle mouse button**, or use a **single finger** on touch devices.
    - **Zoom**: Use the **mouse wheel**, or **pinch-to-zoom** with two fingers on touch devices.
- **Zone Navigation**: Use the navigator in the bottom-right to quickly focus the camera on a specific zone.
- **Customizing Appearance**: Click the **palette icon** in the bottom-right to open the customization panel and change colors.
- **Clear the Board**: Open the customization panel and click the "Clear Board" button. This action is permanent and requires confirmation.

## 🛠️ Technical Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **Persistence**: Browser Local Storage
- **Build**: No build step required. The project uses modern browser features like ES Modules and Import Maps for a zero-config setup.

## 🏁 Getting Started Locally

Because this project uses no build tools, running it locally is very simple. You just need a basic local web server.

1.  **Clone the repository (or have the files locally).**
2.  **Install a simple server (if you don't have one):**
    ```bash
    npm install -g serve
    ```
3.  **Run the server from the project's root directory:**
    ```bash
    serve .
    ```
4.  **Open your browser** and navigate to the local address provided by the server (usually `http://localhost:3000`).
