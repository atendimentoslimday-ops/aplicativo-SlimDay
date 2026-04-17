const fs = require('fs');
const path = 'c:/Users/joaov/OneDrive/Área de Trabalho/Codigo app/aplicativo-slimday/aplicativo-slimday/src/components/SlimDayApp.tsx';

if (!fs.existsSync(path)) {
    console.error("File not found");
    process.exit(1);
}

let content = fs.readFileSync(path, 'utf8');

// Safeguard: Check if defaultProfile is already there
if (content.includes('const defaultProfile')) {
    console.log("Already exists.");
    process.exit(0);
}

const constants = `
const BYPASS_PAYMENT = false; 
const TRIAL_DAYS = 5;
const PROMO_PRICE = "29,90";
const FULL_PRICE = "89,90";
const PROMO_LINK = "https://pay.kirvano.com/a44cda1b-153b-4e9c-85bc-438f8c014322";
const FULL_LINK = "https://pay.kirvano.com/3d0f4079-243d-413d-b5e0-dfde69bb123b";
const APP_SALES_LINK = "https://pay.kirvano.com/6c6c06a4-569b-440a-bc07-d7e1c84f4e73";
const ADMIN_EMAILS = ["atendimentoslimday@gmail.com"];
const DEV_MASTER_KEY = "-=x22450-.çA=-//\\\\";

const defaultProfile: Profile = {
  nome: "",
  idade: "",
  altura: "",
  peso: "",
  objetivo: "emagrecer",
  nivel: "iniciante",
  tempo: "15",
  rotina: "corrida",
  refeicao: "pratico",
  ultimoCiclo: "",
  duracaoCiclo: "28",
  duracaoMenstruacao: "5",
};
`;

// Insert after the imports
const lines = content.split('\n');
const lastImportIndex = lines.reduce((acc, line, idx) => line.startsWith('import') ? idx : acc, 0);

lines.splice(lastImportIndex + 1, 0, constants);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log("Constants restored successfully.");
