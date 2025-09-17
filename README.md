# Minimal Unsatisfiable Core Extractor for MLTL

This tool checks **MLTL (Mission-Time Linear Temporal Logic)** formulas for unsatisfiability and returns **minimal unsatisfiable cores**. 

## Quick Start

1. **Install Node.js and npm**  
   Download and install from [https://nodejs.org/](https://nodejs.org/). This will allow you to run the backend.

2. **Clone the repository**  
   ```sh
   git clone <repository-url>
   cd unsat-cores-mltl/tool
   ```

3. **Install dependencies**
    ```sh
    npm install
    ```
4. **Run the Backend server**
    ```sh
    npm start
    ```
5. **Open the frontend**

    Open the frontend file in vsCode and use "Go Live" to open index.html (or open in a browser and start the live server from vs code)


---


# Getting Started with the MLTL Unsat Core Tool
### A Detailed guide for absolute beginners

This guide walks you through installing and running the Minimal Unsatisfiable Core Extractor for MLTL from scratch. No prior experience is required.

---

## 1. Install Required Tools

### Node.js and npm
1. Go to [https://nodejs.org/](https://nodejs.org/) and download the **LTS version**.
2. Install Node.js using the installer. This will also install **npm**.

To verify installation, run in your terminal or command prompt:

```sh
node -v
npm -v
```
## 2. Clone the Repository
1. Oopen a terminal or command prompt.
2. Navigate the folder where you want the tool:
```sh
cd path\to\your\folder
```
3. Clone the repository:
```sh
git clone <repository-url
cd repository
```

## 3. Install Dependencies
Run the following command to install required Node packages
```sh
npm install
```

## 4. Start the Backend
Start the Node.js server that runs the unsat core extraction:
```sh
npm start
```

## 5. Open the Frontend
1. Open frontend/index.html in **VS Code**
2. Download the Live Server extension
3. Right on the "index.html" file in the frontend folder and choose "open with live server"

This should open your the frontend interface in your default browser.

## 6. Troubleshooting

**Server not starting:** Make sure you ran npm install and Node.js is installed.

**Frontend not showing results:** Ensure the backend server is running and the URL in the fetch request points to http://localhost:3000/check.

**Syntax errors:** Check your MLTL formulas for correct brackets, operators, and variable names.
