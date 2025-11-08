# Doodle Club - Setup Instructions

This guide will walk you through setting up and running the Doodle Club application on your own computer. It's a pure frontend application, so you won't need to install any complex tools.

## Step 1: Create the Project Folder and Files

First, you need to create the folder structure and all the necessary files for the application.

1.  Create a new folder on your computer. Let's call it `doodle-club`.
2.  Inside the `doodle-club` folder, create the following files and folders exactly as shown:

```
doodle-club/
├── components/
│   ├── Canvas.tsx
│   ├── CanvasApp.tsx
│   ├── ChatBox.tsx
│   ├── HomePage.tsx
│   ├── icons.tsx
│   ├── InviteFriendsModal.tsx
│   ├── LoginPage.tsx
│   ├── ProfilePage.tsx
│   ├── RegisterPage.tsx
│   ├── Toolbar.tsx
│   └── UserList.tsx
├── hooks/
│   ├── useDrawing.ts
│   └── useRealtime.ts
├── App.tsx
├── index.html
├── index.tsx
├── INSTRUCTIONS.md  (This file)
├── metadata.json
├── README.md
└── types.ts
```

## Step 2: Copy the Code into Each File

Now, open each file you created in a text editor (like VS Code, Sublime Text, or even Notepad) and copy the complete code provided for that file. Make sure you are copying the code into the correct file.

*For example, open the `App.tsx` file you created and paste the entire code for `App.tsx` into it. Do this for all 20 files.*

## Step 3: Run the Application

To run the application, the best method is to use a simple local web server. This ensures all features, like the "Copy to Clipboard" button, work correctly.

1.  **Open your computer's terminal or command prompt.**
2.  **Navigate into the project folder** you created. For example:
    ```sh
    cd path/to/your/doodle-club
    ```
3.  **Run ONE of the following commands** (depending on what you have installed):

    *   **If you have Python:**
        ```sh
        python -m http.server
        ```
    *   **If you have Node.js:**
        ```sh
        npx serve
        ```
        *(If it's your first time using `serve`, it might ask you to install it. Just type `y` and press Enter.)*

4.  The terminal will show you a local address. **Open your web browser** (like Chrome or Firefox) and go to that address. It will usually be:
    *   `http://localhost:8000` (for Python)
    *   `http://localhost:3000` (for `serve`)

The Doodle Club application should now be running in your browser!

## How to Test with Multiple Users

To see the real-time collaboration features, you need to simulate multiple users.

1.  **Open the app in a regular browser window** and register/log in with a user (e.g., User A).
2.  Create a private room.
3.  Click the "Share" button on that room to copy its link.
4.  **Open a new "Incognito" or "Private" browser window.** This is important because it lets you log in as a different person.
5.  **Paste the link** into the incognito window's address bar.
6.  The app will ask you to log in. **Register a new account** (e.g., User B).
7.  After logging in, you'll be prompted for the room's password (if you set one). Enter it, and you will join the same canvas as User A!

Now you can draw in both windows and see the strokes, cursors, and chat messages appear in real-time.