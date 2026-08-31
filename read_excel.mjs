import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile('/home/alek/projects/ara_hunter_apps/Daftar_Emiten_IDX_2026.xlsx');
const worksheet = workbook.worksheets[0];
const headers = worksheet.getRow(1).values;
console.log("Headers:", headers);
worksheet.eachRow((row, rowNumber) => {
  if (rowNumber <= 5) {
    console.log(`Row ${rowNumber}:`, row.values);
  }
  if (rowNumber === 5) {
    console.log("Total rows:", worksheet.rowCount);
  }
});
