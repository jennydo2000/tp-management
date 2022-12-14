import { saveSemesterDataService } from "./SemesterIO.services";
import { CellObject, CellStyle, utils as xlsxUtils, writeFile } from "xlsx-js-style";

interface SheetColumn {
    title: string,
    key: string,
    render?: (value: any) => string,
}

interface SemesterData {
    activities: any[],
    title_activities: any[],
    student_activities: any[],
}

export const getTableSheet = (columns: SheetColumn[], data: any[]) => {
    const headerCellStyle: CellStyle = {
        font: {
            name: "Times New Roman",
            sz: 11,
            bold: true,
        },
        border: {
            left: {style: "thin", color: {rgb: "000000"}},
            right: {style: "thin", color: {rgb: "000000"}},
            top: {style: "thin", color: {rgb: "000000"}},
            bottom: {style: "thin", color: {rgb: "000000"}},
        },
    }

    const cellStyle: CellStyle = {
        font: {
            name: "Times New Roman",
            sz: 11,
        },
        border: {
            left: {style: "thin", color: {rgb: "000000"}},
            right: {style: "thin", color: {rgb: "000000"}},
            top: {style: "thin", color: {rgb: "000000"}},
            bottom: {style: "thin", color: {rgb: "000000"}},
        },
    }

    const tableDataHeaders: CellObject[] = [{v: "STT", t: "s", s: headerCellStyle}];
    columns.forEach((column) => tableDataHeaders.push({v: column.title, t: "s", s: headerCellStyle}));

    const tableData: any[] = [tableDataHeaders];

    data.forEach((item, index) => {
        const row = [{v: index+1, t: "s", s: cellStyle}];
        columns.forEach((column) => {
            const value = column.render ? column.render(item[column.key]) : item[column.key];
            return row.push({v: value || '', t: "s", s: cellStyle});
        });
        tableData.push(row);
    });

    return tableData;
}

export const handleSaveData = async (semesterId: number | undefined) => {
    const semesterData:SemesterData = await saveSemesterDataService(semesterId);
    const workbook = xlsxUtils.book_new();

    const activityWorksheet = xlsxUtils.aoa_to_sheet(getTableSheet([
        {title: "Lo???i ho???t ?????ng", key: "activity_type_id"},
        {title: "Thu???c nh??m", key: "group"},
        {title: "M?? ho???t ?????ng", key: "code"},
        {title: "T??n ho???t ?????ng", key: "name"},
        {title: "Th???i gian b???t ?????u", key: "time_start"},
        {title: "Th???i gian k???t th??c", key: "time_end"},
        {title: "?????a ??i???m", key: "address"},
        {title: "M?? t???", key: "description"},
        {title: "????n v??? t??? ch???c", key: "host"},
        {title: "Ki???u", key: "type"},
        {title: "Gi?? tr??? ch???p nh???n", key: "accepts", render: (value) => value?.toString() || ''},
        {title: "Gi?? tr??? m???c ?????nh", key: "default_value"},
    ], semesterData.activities));

    const studentActivityWorksheet = xlsxUtils.aoa_to_sheet(getTableSheet([
        {title: "M?? sinh vi??n", key: "student_code"},
        {title: "M?? ho???t ?????ng", key: "activity_code"},
        {title: "Gi?? tr???", key: "value"},
    ], semesterData.student_activities));
    const titleActivityWorksheet = xlsxUtils.aoa_to_sheet(getTableSheet([
        {title: "Ti??u ????? c???p 3", key: "third_title_id"},
        {title: "M?? ho???t ?????ng", key: "activity_code"},
        {title: "??i???m", key: "point", render: (value) => JSON.stringify(value) || ''},
        {title: "Tu??? ch???nh", key: "options", render: (value) => JSON.stringify(value) || ''},
    ], semesterData.title_activities));
    xlsxUtils.book_append_sheet(workbook, activityWorksheet, "Ho???t ?????ng");
    xlsxUtils.book_append_sheet(workbook, studentActivityWorksheet, "????nh gi?? sinh vi??n");
    xlsxUtils.book_append_sheet(workbook, titleActivityWorksheet, "C???u h??nh ????nh gi??");
    writeFile(workbook, "Data.xlsx");
}