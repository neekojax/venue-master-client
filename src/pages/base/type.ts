// @ts-ignore

export type Values = {
  templateName: string;
  templateID: number;
  fields: Field[];
};

export type Field = {
  ID: number;
  value: string;
  status: "default" | "new" | "modified" | "deleted";
};

export type TemplateDataChange = {
  ID: number;
  templateNameBefore: string;
  templateNameAfter: string;
  fields: Field[];
};

export type TemplateDataNew = {
  ID: number;
  templateName: string;
  fields: Field[];
};
