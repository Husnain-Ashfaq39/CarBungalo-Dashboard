// src/pages/Banners/BannerEdit.js

import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Input, Label, Form, FormFeedback, Button, CardHeader } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [bannerData, setBannerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setIsLoading(true);
        const banner = await db.banners.get(id);
        setBannerData(banner);
        const imageUrlResponse = storageServices.images.getFilePreview(banner.imageId);
        setExistingImageUrl(imageUrlResponse.href);
      } catch (error) {
        console.error("Failed to fetch banner:", error);
        toast.error("Failed to fetch banner data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanner();
  }, [id]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: { title: bannerData?.title || "", subtitle: bannerData?.subtitle || "" },
    validationSchema: Yup.object({
      title: Yup.string().required("Please enter a title"),
      subtitle: Yup.string().required("Please enter a subtitle"),
    }),
    onSubmit: async (values) => {
      try {
        let imageId = bannerData.imageId;
        if (selectedFile) {
          const uploadedImage = await storageServices.images.createFile(selectedFile);
          imageId = uploadedImage.$id;
          if (bannerData.imageId) await storageServices.images.deleteFile(bannerData.imageId);
        }

        const updatedBannerData = { title: values.title, subtitle: values.subtitle, imageId };
        await db.banners.update(id, updatedBannerData);

        toast.success("Banner updated successfully");
        navigate("/bannerlist");
      } catch (error) {
        console.error("Error updating banner:", error);
        toast.error("Failed to update banner. Please try again.");
      }
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setFileRejectionErrors([]);
        setExistingImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    onDropRejected: (fileRejections) => {
      setSelectedFile(null);
      setFileRejectionErrors(fileRejections.map((file) => file.errors.map((err) => err.message).join(", ")));
    },
  });

  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="py-4 text-center">
            <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" colors="primary:#405189,secondary:#0ab39c" style={{ width: "72px", height: "72px" }}></lord-icon>
            <div className="mt-4"><h5>Loading data!</h5></div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit Banner" pageTitle="Banners" />
        <Form onSubmit={validation.handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="title-input">
                      Title <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="title-input"
                      placeholder="Enter title"
                      name="title"
                      value={validation.values.title}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={validation.errors.title && validation.touched.title}
                    />
                    {validation.errors.title && validation.touched.title && (
                      <FormFeedback>{validation.errors.title}</FormFeedback>
                    )}
                  </div>

                  <div className="mb-3">
                    <Label className="form-label" htmlFor="subtitle-input">
                      Subtitle <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="subtitle-input"
                      placeholder="Enter subtitle"
                      name="subtitle"
                      value={validation.values.subtitle}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={validation.errors.subtitle && validation.touched.subtitle}
                    />
                    {validation.errors.subtitle && validation.touched.subtitle && (
                      <FormFeedback>{validation.errors.subtitle}</FormFeedback>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Banner Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getRootProps()} className="dropzone dz-clickable">
                    <input {...getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                      {isDragActive && <p className="mt-2 text-primary">Drop the files here...</p>}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">{fileRejectionErrors.join(", ")}</div>
                      )}
                    </div>
                  </div>
                  {existingImageUrl && (
                    <div className="mt-3">
                      <img src={existingImageUrl} alt="Selected" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="text-end mb-3">
                <Button type="submit" color="success">Update Banner</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default BannerEdit;
