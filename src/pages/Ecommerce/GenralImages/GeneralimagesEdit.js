// src/pages/HeroSection/HeroSectionEdit.js

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Form,
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
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";

const GeneralDataEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedLoginFile, setSelectedLoginFile] = useState(null);
  const [existingLoginImageUrl, setExistingLoginImageUrl] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false); // State to handle errors or no data

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        const hero = await db.GeneralData.get(id);
        if (!hero) {
          setHasError(true);
          toast.error("No data found for the provided ID.");
          return;
        }
        setHeroData(hero);

        if (hero.logo) {
          const loginImageUrlResponse = storageServices.images.getFileDownload(
            hero.logo
          );
          setExistingLoginImageUrl(loginImageUrlResponse);
        }
      } catch (error) {
        console.error("Failed to fetch Images:", error);
        toast.error("Failed to fetch Images data.");
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroSection();
  }, [id]);

  const validation = useFormik({
    enableReinitialize: true,
    // Update `initialValues` and `validationSchema`
    initialValues: {
      logo: heroData?.logo || "",
      facebook: heroData?.facebook || "",
      twitter: heroData?.twitter || "",
      instagram: heroData?.instagram || "",
      linkedin: heroData?.linkedin || ""
    },
    validationSchema: Yup.object({
      facebook: Yup.string().url("Invalid Facebook URL"),
      twitter: Yup.string().url("Invalid Twitter URL"),
      instagram: Yup.string().url("Invalid Instagram URL"),
      linkedin: Yup.string().url("Invalid LinkedIn URL"),
      // Add other validations as necessary
    }),

    onSubmit: async (values) => {
      try {
        let logo = heroData.logo;

        if (selectedLoginFile) {
          const uploadedLoginImage = await storageServices.images.createFile(
            selectedLoginFile
          );
          logo = uploadedLoginImage.$id;

          if (heroData.logo) {
            await storageServices.images.deleteFile(heroData.logo);
          }
        }

        const updatedHeroData = {
          logo,
          facebook: values.facebook,
          twitter: values.twitter,
          instagram: values.instagram,
          linkedin: values.linkedin
        };

        await db.GeneralData.update(id, updatedHeroData);
        toast.success("Images updated successfully");
        navigate("/generalimageslist");
      } catch (error) {
        console.error("Error updating Images:", error);
        toast.error("Failed to update Images. Please try again.");
      }
    },
  });

  const { getRootProps: getLoginRootProps, getInputProps: getLoginInputProps } =
    useDropzone({
      accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
      maxSize: 5242880,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          setSelectedLoginFile(acceptedFiles[0]);
          setExistingLoginImageUrl(URL.createObjectURL(acceptedFiles[0]));
        }
      },
    });

  // Helper function to render loading animation
  const renderLoadingAnimation = () => (
    <div
      className="d-flex justify-content-center align-items-center flex-column"
      style={{ minHeight: "300px" }}
    >
      <Lottie
        animationData={loadingAnimation}
        style={{ width: 150, height: 150 }}
        loop={true}
      />
      <div className="mt-3">
        <h5>Loading data!</h5>
      </div>
    </div>
  );

  // Helper function to render no data or error animation
  const renderNoDataAnimation = () => (
    <div
      className="d-flex justify-content-center align-items-center flex-column"
      style={{ minHeight: "300px" }}
    >
      <Lottie
        animationData={noDataAnimation}
        style={{ width: 150, height: 150 }}
        loop={true}
      />
      <div className="mt-3">
        <h5>No Images Found.</h5>
      </div>
    </div>
  );

  // Function to get image URL
  const getImageURL = (imageId) => {
    if (!imageId) return null;
    const imageUrlResponse = storageServices.images.getFileDownload(imageId);
    return imageUrlResponse;
  };

  // Memoize the form to prevent unnecessary re-renders
  const renderForm = useMemo(() => {
    return (
      <Form onSubmit={validation.handleSubmit}>
        <Row>
          <Col lg={8}>
            {/* Login Image Upload */}
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Login Image</h5>
              </CardHeader>
              <CardBody>
                <div
                  {...getLoginRootProps()}
                  className="dropzone dz-clickable"
                  style={{

                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
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
                    <img
                      src={existingLoginImageUrl}
                      alt="Selected"
                      className="img-thumbnail"
                      width="200"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Submit Button */}
            
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <label htmlFor="facebook" className="form-label">Facebook URL</label>
              <input
                type="text"
                className="form-control"
                id="facebook"
                value={validation.values.facebook}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter Facebook URL"
              />
              {validation.touched.facebook && validation.errors.facebook ? (
                <div className="text-danger">{validation.errors.facebook}</div>
              ) : null}
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <label htmlFor="twitter" className="form-label">Twitter URL</label>
              <input
                type="text"
                className="form-control"
                id="twitter"
                value={validation.values.twitter}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter Twitter URL"
              />
              {validation.touched.twitter && validation.errors.twitter ? (
                <div className="text-danger">{validation.errors.twitter}</div>
              ) : null}
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <label htmlFor="instagram" className="form-label">Instagram URL</label>
              <input
                type="text"
                className="form-control"
                id="instagram"
                value={validation.values.instagram}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter Instagram URL"
              />
              {validation.touched.instagram && validation.errors.instagram ? (
                <div className="text-danger">{validation.errors.instagram}</div>
              ) : null}
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <label htmlFor="linkedin" className="form-label">LinkedIn URL</label>
              <input
                type="text"
                className="form-control"
                id="linkedin"
                value={validation.values.linkedin}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter LinkedIn URL"
              />
              {validation.touched.linkedin && validation.errors.linkedin ? (
                <div className="text-danger">{validation.errors.linkedin}</div>
              ) : null}
            </div>
          </Col>
          <div className="text-end mb-3">
              <Button type="submit" color="success">
                Update Images
              </Button>
            </div>
        </Row>

      </Form>
    );
  }, [
    validation.handleSubmit,
    getLoginRootProps,
    getLoginInputProps,
    existingLoginImageUrl,
  ]);

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit Images" pageTitle="Images" />
        {isLoading ? (
          // Loading Indicator
          renderLoadingAnimation()
        ) : hasError ? (
          // No Data or Error Indicator
          renderNoDataAnimation()
        ) : (
          renderForm
        )}
      </Container>
    </div>
  );
};

export default GeneralDataEdit;
