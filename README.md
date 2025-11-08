# Doodle Club - Collaborative Canvas

This is a real-time, multi-user collaborative drawing application built entirely with React and TypeScript, using the browser's `localStorage` to simulate a backend database for users, rooms, and drawing history.

## ✨ Features

- **User Authentication**: Simple register and login system.
- **Lobby / Home Page**: See online users, create private rooms, or join a public canvas.
- **Password-Protected Rooms**: Secure your private rooms with a password.
- **User Profiles & Friends**: Create a profile with a bio and add other users as friends.
- **Room Sharing**: Easily invite friends to your private rooms with a shareable link.
- **Real-time Drawing**: A smooth, lag-free drawing experience with instant stroke rendering.
- **Drawing Tools**: Includes a brush, eraser, color picker, and adjustable stroke width.
- **Undo/Redo**: Full history control for your drawing sessions.

## 🚀 How to Run the Application

This project is a pure frontend application and does not require a complex build process or a dedicated backend server.

### Method 1: Simple (Open the file directly)

1.  Download and unzip the project files.
2.  Navigate to the project folder.
3.  Double-click the `index.html` file to open it in your favorite web browser (like Chrome, Firefox, or Safari).

**Note**: Some browser security features might limit functionality (like the one-click "Copy to Clipboard" feature) when opening files directly. For the best experience, use Method 2.

### Method 2: Recommended (Using a local web server)

Running the app from a local server is the best way to experience all its features. It's very simple and only requires one command.

1.  **Open your terminal or command prompt.**
2.  **Navigate to the project directory** where `index.html` is located. For example: `cd path/to/your/project-folder`.
3.  **Run one of the following commands**:

    *   **If you have Python installed:**
        ```bash
        python -m http.server
        ```
    *   **If you have Node.js installed:**
        ```bash
        npx serve
        ```
        (If you don't have `serve`, it will ask you to install it. Just type `y` and press Enter).

4.  **Open your browser** and go to the address shown in the terminal (usually `http://localhost:8000` or `http://localhost:3000`).

##  simulating Multiple Users

To test the collaborative features, you need to simulate having more than one person in a room.

1.  **Open the app in a regular browser window** and log in with your first user.
2.  **Create a private room** (you can add a password if you like).
3.  **Click the "Share" button** for that room to copy the link.
4.  **Open a new "Incognito" or "Private" browser window.** This will let you log in as a different user.
5.  **Paste the link** into the incognito window's address bar.
6.  You'll be asked to log in. **Register a second user account.**
7.  After logging in, you will be prompted for the room's password (if you set one). Enter it, and you will join the same canvas as your first user!

Now you can draw in both windows and see the results in real-time.
