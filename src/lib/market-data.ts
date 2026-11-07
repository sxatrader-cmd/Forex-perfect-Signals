import historyJson from "../../data/history.json";
import newsJson from "../../data/news.json";
import signalsJson from "../../data/signals.json";
import type { HistoryFile, NewsFile, SignalsFile } from "./types";

export const signalsData = signalsJson as SignalsFile;
export const historyData = historyJson as HistoryFile;
export const newsData = newsJson as NewsFile;
