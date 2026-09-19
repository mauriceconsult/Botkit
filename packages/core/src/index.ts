import { Command } from "commander";
import { sendMaxintelMessage } from "./clients/maxintel";

const program = new Command();

program.name("botkit").description("Maxnovate platform CLI");

const maxintel = program.command("maxintel").description("Maxintel commands");

maxintel
  .command("send")
  .description("Send a message to a Maxintel chat")
  .argument("<chatId>", "Maxintel chat ID")
  .argument("<message>", "Content to send")
  .action(async (chatId: string, message: string) => {
    const result = await sendMaxintelMessage({ chatId, message });
    console.log(`Sent to chat ${result.chatId}: ${result.status}`);
  });

program.parseAsync(process.argv);
