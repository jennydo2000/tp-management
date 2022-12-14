import { SaveOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, message, Modal, PageHeader, Row, Space, Typography } from "antd";
import { useState } from "react";
import CustomDragger from "../../../components/CustomDragger/CustomDragger";
import CustomForm from "../../../components/CustomForm/CustomForm";
import { handleServerError } from "../../../utils/error";
import { settingLoadFormFields } from "./SemesterIO.constants";
import { loadSemesterDataService, saveSemesterDataService } from "./SemesterIO.services";

interface ImportActivityProps {
    semesterId: number;
    onChange: () => void;
}

export const SemesterIO: React.FC<ImportActivityProps> = (props) => {
    const {semesterId, onChange} = props;
    const [loadedFile, setLoadedFile] = useState({});
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [loadValues, setLoadValues] = useState<SettingLoadValues>({semester: true, semester_student: true, activity: true, title_activity: true, student_activity: true});

    const openModal = () => setShowModal(true);

    const closeModal = () => setShowModal(false);

    const importFile = (file: Blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const loadedFile = JSON.parse(e.target?.result as string);
            setLoadedFile(loadedFile);
        }
        reader.readAsText(file);
    }

    const handleSaveData = async () => {
        const semesterData = await saveSemesterDataService(semesterId);
        const blob = new Blob([JSON.stringify(semesterData)], {type: "text/plain"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Data-${semesterId}.json`;
        link.href = url;
        link.click();
    }

    const handleLoadData = async () => {
        const data = {
            loadedFile: loadedFile,
            accepts: loadValues,
        }
        message.loading({key: "setting-load-semester-data", content: "??ang nh???p"});
        loadSemesterDataService(
            semesterId,
            data,
            async () => {
                onChange();
                closeModal();
                message.success({key: "setting-load-semester-data", content: "???? nh???p"});
            },
            responseData => {
                setErrors(handleServerError(responseData.errors));
                message.error({key: "setting-load-semester-data", content: "L??u l???i"});
            }
        );
    }

    return (
        <>
            <PageHeader
                className="page-header"
                title="Nh???p/Xu???t d??? li???u"
                extra={<Button onClick={handleSaveData} icon={<SaveOutlined />}>Xu???t d??? li???u</Button>}
            />
            <Card style={{width: "100%", flexGrow: 1, height: "calc(100vh - 261px)"}}>
                <Row>
                    <Col xs={16}>
                        <Space direction="vertical" style={{width: "100%", alignItems: "center"}}>
                            <Typography.Title level={5}>Nh???p file</Typography.Title>
                            <CustomDragger
                                onUpload={importFile}
                                maxCount={1}
                            />
                            <Button onClick={openModal} type="primary">Nh???p</Button>
                        </Space>
                    </Col>
                    <Col xs={8}>
                        <Space direction="vertical" style={{width: "100%", alignItems: "center"}}>
                            <Typography.Title level={5}>L???a ch???n d??? li???u nh???p v??o</Typography.Title>
                            <Card>
                                <CustomForm
                                    col={{label: 20, wrapper: 4}}
                                    layout="horizontal"
                                    fields={settingLoadFormFields(loadValues)}
                                    hideSubmitButton={true}
                                    onValuesChange={(values) => setLoadValues(values)}
                                />
                            </Card>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Modal
                title="X??c nh???n nh???p"
                destroyOnClose
                centered
                visible={showModal}
                onCancel={closeModal}
                footer={[
                    <Button key="back" onClick={closeModal}>
                        ????ng
                    </Button>,
                    <Button
                        key="import"
                        type="primary"
                        onClick={handleLoadData}
                    >
                        Nh???p
                    </Button>,
                ]}
            >
                <Alert message="L??u ??: D??? li???u nh???p s??? ghi ???? l??n d??? li???u hi???n t???i!" type="warning" showIcon />
            </Modal>
        </>
    );
}

SemesterIO.defaultProps = {
    semesterId: 0,
    onChange: () => {},
}

export default SemesterIO;