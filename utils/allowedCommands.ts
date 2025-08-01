// src/utils/allowedCommands.ts
const allowedCommands: { [key: string]: string } = {
  "open notepad": "start notepad",
  "open chrome": "start chrome",
  "delete mt folder": "rmdir /s /q mt",
  "create file": "echo Hello from Chitthi > chitthi.txt",
  "open google": "start chrome https://www.google.com",
};

export default allowedCommands;
