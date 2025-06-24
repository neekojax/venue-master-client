export type Values = {
  templateName: string;
  fields: Field[];
};

export type Field = {
  ID: number;
  FieldName: string;
  Value: string;
};

export type VenueRecordNew = {
  templateID: number;
  fields: Field[];
};

export type VenueRecordUpdate = {
  RecordID: number;
  Fields: Field[];
};
