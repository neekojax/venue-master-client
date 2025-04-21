// import { useEffect, useState } from "react";
// import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
// import { Button, message } from "antd";
// import EditModal from "./edit-modal";
// import type { Values, VenueRecordNew } from "@/pages/venue/type.ts";
// import { useVenueRecordNew } from "@/pages/venue/hook/hook.ts";
// type AddButtonProps = {
//   templates: any;
//   selectedTemplate: any;
//   fields: any;
// };
//
// const createPromise = (data: any) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(data);
//     }, 1000);
//   });
// };
//
// export default function AddVenueRecordButton({ templates, selectedTemplate, fields }: AddButtonProps) {
//   const [open, setOpen] = useState(false);
//
//   const mutation = useVenueRecordNew();
//
//   const transformDataToValues = (templates: any, selectedTemplate: any, fields: any): Values => {
//     const templateNames = templates
//       .filter((template: any) => template.ID === selectedTemplate)
//       .map((template: any) => template.TemplateName);
//     const templateName = templateNames.length > 0 ? templateNames[0] : null; // 获取第一个模板名称或 null
//     return {
//       templateName: templateName || "",
//       fields: fields?.map((field: any) => ({
//         ID: field.ID,
//         FieldName: field.FieldName || "", // 提供默认值
//         Value: "",
//       })),
//     };
//   };
//
//   const handleSubmit = (venueRecord: VenueRecordNew) => {
//     const venueRecord: VenueRecordNew = {
//       templateID: selectedTemplate,
//       fields: values.fields,
//     };
//     mutation.mutate(venueRecord, {
//       onSuccess: (data) => {
//         message.success("添加成功");
//         setOpen(false);
//       },
//       onError: (error) => {
//         message.error(`添加失败: ${error.message}`);
//       },
//     });
//   };
//
//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);
//
//   const onCreate = (values: Values) => {
//     const venueRecord: VenueRecordNew = {
//       templateID: selectedTemplate,
//       fields: values.fields,
//     };
//
//     // // 调用 handleSubmit
//     handleSubmit(venueRecord);
//
//     return createPromise(values);
//   };
//
//   // @ts-ignore
//   return (
//     <>
//       <Button
//         type="primary"
//         danger
//         size="middle"
//         icon={<PlusOutlined style={{ color: "white" }} />}
//         style={{
//           backgroundColor: "#40A9FF", // 设置背景颜色
//           borderColor: "#40A9FF", // 设置边框颜色
//           color: "#FFFFFF", // 设置文字颜色
//         }}
//         onClick={handleOpen}
//       >
//         添加场地
//       </Button>
//       <EditModal
//         open={open}
//         initialValues={transformDataToValues(templates.data, selectedTemplate, fields)}
//         onCreate={onCreate}
//         onCancel={handleClose}
//       />
//     </>
//   );
// }
