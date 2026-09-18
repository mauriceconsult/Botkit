import { Command } from "commander";

const program = new Command();

program
  .name("botkit")
  .description("A simple CLI tool")
  .command("maxintel")
  .description("Create a new maxintel project")
  .argument("<chatId>", "Maxintel chat ID")
  .argument("<message>", "Content to send")
  .action(async (chatId: string, message: string) => {
    console.log(`Maxintel project created for chat: ${chatId}`);
    console.log(`Message: ${message}`);
  });

program.parseAsync(process.argv);
