import { Select } from "antd";

type SelectProps = {
  templates: any;
  selectedTemplate: any;
  onTemplateChange: (templateId: number) => void;
};

export default function TemplateSelect({ templates, selectedTemplate, onTemplateChange }: SelectProps) {
  return (
    <Select
      placeholder="请选择场地模板"
      style={{ width: 200 }}
      onChange={onTemplateChange}
      value={selectedTemplate ?? undefined} // 使下拉框默认选择当前的 selectedTemplate
      // loading={loading}
    >
      {templates.map((template: any) => (
        <Select.Option key={template.ID} value={template.ID}>
          {template.TemplateName}
        </Select.Option>
      ))}
    </Select>
  );
}
