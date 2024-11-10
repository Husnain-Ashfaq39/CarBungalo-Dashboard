// src/pages/Banners/BannerAdd.js

import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row, Input, Label, Form, FormFeedback, Button, CardHeader } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BannerAdd = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);

  const validation = useFormik({
    initialValues: { title: "", subtitle: "" },
    validationSchema: Yup.object({
      title: Yup.string().required("Please enter a title"),
      subtitle: Yup.string().required("Please enter a subtitle"),
    }),
    onSubmit: async (values) => {
      try {
        if (!selectedFile) {
          toast.error("Please select an image");
          return;
        }

        const uploadedImage = await storageServices.images.createFile(selectedFile);
        const imageId = uploadedImage.$id;

        const bannerData = {
          title: values.title,
          subtitle: values.subtitle,
          imageId,
        };

        await db.banners.create(bannerData);

        toast.success("Banner has been added successfully");
        navigate("/bannerlist");
      } catch (error) {
        console.error("Error adding banner:", error);
        toast.error("Failed to add banner. Please try again.");
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
      }
    },
    onDropRejected: (fileRejections) => {
      setSelectedFile(null);
      setFileRejectionErrors(fileRejections.map((file) => file.errors.map((err) => err.message).join(", ")));
    },
  });

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Add Banner" pageTitle="Banners" />
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
                  {selectedFile && (
                    <div className="mt-3">
                      <img src={URL.createObjectURL(selectedFile)} alt="Selected" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="text-end mb-3">
                <Button type="submit" color="success">Add Banner</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default BannerAdd;