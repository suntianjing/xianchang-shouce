export type TrackId = "vue2" | "vue3" | "scene";

export type CodeLang = "vue" | "js" | "ts" | "html";

export type CompareBlock = {
  code: string;
  lang?: CodeLang;
  caption?: string;
};

export type Section =
  | { type: "prose"; title?: string; body: string }
  | {
      type: "compare";
      title: string;
      vue2: CompareBlock;
      vue3: CompareBlock;
      note?: string;
    }
  | {
      type: "playground";
      title: string;
      version: 2 | 3;
      template: string;
      script: string;
      hint?: string;
      components?: string;
    }
  | {
      type: "pitfall";
      title: string;
      wrong: string;
      right: string;
      why: string;
    }
  | {
      type: "scene";
      demand: string;
      trap: string;
      fix: string;
      extra?: string;
    }
  | {
      type: "table";
      title?: string;
      columns: string[];
      rows: string[][];
    };

export type Lesson = {
  slug: string;
  track: TrackId;
  title: string;
  kicker: string;
  minutes: number;
  summary: string;
  takeaways: string[];
  sections: Section[];
};

export type TrackMeta = {
  id: TrackId;
  title: string;
  kicker: string;
  blurb: string;
};

export type QuizQuestion = {
  id: string;
  topic: string;
  question: string;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
  related?: { track: TrackId; slug: string };
};

export type CheatGroup = {
  id: string;
  title: string;
  caption: string;
  columns: string[];
  rows: string[][];
};

export type PathDay = {
  id: string;
  title: string;
  kicker: string;
  blurb: string;
  items: { track: TrackId; slug: string }[];
};

export type GlossaryItem = {
  term: string;
  def: string;
  tip?: string;
  related?: { track: TrackId; slug: string };
};

export type GlossaryGroup = {
  id: string;
  title: string;
  items: GlossaryItem[];
};
