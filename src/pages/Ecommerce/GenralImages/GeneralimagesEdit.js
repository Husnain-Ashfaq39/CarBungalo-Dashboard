// src/pages/HeroSection/HeroSectionEdit.js

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Input,
  Label,
  Form,
  FormFeedback,
  Button,
  CardHeader,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GeneralimagesEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLoginFile, setSelectedLoginFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [existingLoginImageUrl, setExistingLoginImageUrl] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWholesaleFile, setSelectedWholesaleFile] = useState(null);
  const [selectedContactFile, setSelectedContactFile] = useState(null);
  const [selectedPolicyFile, setSelectedPolicyFile] = useState(null);
  const [existingWholesaleImageUrl, setExistingWholesaleImageUrl] = useState(null);
  const [existingContactImageUrl, setExistingContactImageUrl] = useState(null);
  const [existingPolicyImageUrl, setExistingPolicyImageUrl] = useState(null);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        const hero = await db.Generalimages.get(id);
        setHeroData(hero);

       

        if (hero.loginImage) {
          const loginImageUrlResponse = storageServices.images.getFilePreview(hero.loginImage);
          setExistingLoginImageUrl(loginImageUrlResponse.href);
        }

        if (hero.wholesaleImage) {
          const wholesaleImageUrlResponse = storageServices.images.getFilePreview(hero.wholesaleImage);
          setExistingWholesaleImageUrl(wholesaleImageUrlResponse.href);
        }

        if (hero.contactImage) {
          const contactImageUrlResponse = storageServices.images.getFilePreview(hero.contactImage);
          setExistingContactImageUrl(contactImageUrlResponse.href);
        }

        if (hero.policyImage) {
          const policyImageUrlResponse = storageServices.images.getFilePreview(hero.policyImage);
          setExistingPolicyImageUrl(policyImageUrlResponse.href);
        }
      } catch (error) {
        console.error("Failed to fetch Images:", error);
        toast.error("Failed to fetch Images data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroSection();
  }, [id]);

  const validation = useFormik({
    enableReinitialize: true,
    
    onSubmit: async (values) => {
      try {
        let imageId = heroData.imageId;
        let loginImage = heroData.loginImage;
        let wholesaleImage = heroData.wholesaleImage;
        let contactImage = heroData.contactImage;
        let policyImage = heroData.policyImage;

       

        if (selectedLoginFile) {
          const uploadedLoginImage = await storageServices.images.createFile(selectedLoginFile);
          loginImage = uploadedLoginImage.$id;
          if (heroData.loginImage) await storageServices.images.deleteFile(heroData.loginImage);
        }

        if (selectedWholesaleFile) {
          const uploadedWholesaleImage = await storageServices.images.createFile(selectedWholesaleFile);
          wholesaleImage = uploadedWholesaleImage.$id;
          if (heroData.wholesaleImage) await storageServices.images.deleteFile(heroData.wholesaleImage);
        }

        if (selectedContactFile) {
          const uploadedContactImage = await storageServices.images.createFile(selectedContactFile);
          contactImage = uploadedContactImage.$id;
          if (heroData.contactImage) await storageServices.images.deleteFile(heroData.contactImage);
        }

        if (selectedPolicyFile) {
          const uploadedPolicyImage = await storageServices.images.createFile(selectedPolicyFile);
          policyImage = uploadedPolicyImage.$id;
          if (heroData.policyImage) await storageServices.images.deleteFile(heroData.policyImage);
        }

        const updatedHeroData = {
          
          loginImage,
          wholesaleImage,
          contactImage,
          policyImage
        };

        await db.heroSection.update(id, updatedHeroData);

        toast.success("Images updated successfully");
        navigate("/generalimageslist");
      } catch (error) {
        console.error("Error updating Images:", error);
        toast.error("Failed to update Images. Please try again.");
      }
    },
  });
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setFileRejectionErrors([]);
        setExistingImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    onDropRejected: (fileRejections) => {
      setSelectedFile(null);
      const errors = fileRejections.map((fileRejection) => fileRejection.errors.map((error) => error.message).join(", "));
      setFileRejectionErrors(errors);
    },
  });

  const { getRootProps: getLoginRootProps, getInputProps: getLoginInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedLoginFile(acceptedFiles[0]);
        setExistingLoginImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
  });

  const { getRootProps: getWholesaleRootProps, getInputProps: getWholesaleInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedWholesaleFile(acceptedFiles[0]);
        setExistingWholesaleImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
  });

  const { getRootProps: getContactRootProps, getInputProps: getContactInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedContactFile(acceptedFiles[0]);
        setExistingContactImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
  });

  const { getRootProps: getPolicyRootProps, getInputProps: getPolicyInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedPolicyFile(acceptedFiles[0]);
        setExistingPolicyImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
  });

  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="py-4 text-center">
            <div>
              <lord-icon
                src="https://cdn.lordicon.com/msoeawqm.json"
                trigger="loop"
                colors="primary:#405189,secondary:#0ab39c"
                style={{ width: "72px", height: "72px" }}
              ></lord-icon>
            </div>
            <div className="mt-4">
              <h5>Loading data!</h5>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit Images" pageTitle="Images" />
        <Form onSubmit={validation.handleSubmit}>
          <Row>
            <Col lg={8}>
              

              {/* Login Image Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Login Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getLoginRootProps()} className="dropzone dz-clickable">
                    <input {...getLoginInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                    </div>
                  </div>
                  {existingLoginImageUrl && (
                    <div className="mt-3">
                      <img src={existingLoginImageUrl} alt="Selected" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Wholesale Image Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Wholesale Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getWholesaleRootProps()} className="dropzone dz-clickable">
                    <input {...getWholesaleInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                    </div>
                  </div>
                  {existingWholesaleImageUrl && (
                    <div className="mt-3">
                      <img src={existingWholesaleImageUrl} alt="Wholesale" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Contact Image Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Contact Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getContactRootProps()} className="dropzone dz-clickable">
                    <input {...getContactInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                    </div>
                  </div>
                  {existingContactImageUrl && (
                    <div className="mt-3">
                      <img src={existingContactImageUrl} alt="Contact" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Policy Image Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Policy Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getPolicyRootProps()} className="dropzone dz-clickable">
                    <input {...getPolicyInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                    </div>
                  </div>
                  {existingPolicyImageUrl && (
                    <div className="mt-3">
                      <img src={existingPolicyImageUrl} alt="Policy" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Submit Button */}
              <div className="text-end mb-3">
                <Button type="submit" color="success">
                  Update Images
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default GeneralimagesEdit;
