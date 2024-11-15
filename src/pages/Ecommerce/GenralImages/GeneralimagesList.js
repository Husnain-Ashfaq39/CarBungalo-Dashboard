// src/pages/HeroSection/HeroSectionList.js

import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Col,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Link } from "react-router-dom";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";

const GeneralimagesList = () => {
  const [heroSection, setHeroSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        const response = await db.GeneralData.list();
        let heroData = response.documents[0];

        if (!heroData) {
          // Updated dummyData to include terms
          const dummyData = {
            logo: "",
            facebook: "https://www.facebook.com",
            twitter: "https://www.twitter.com",
            instagram: "https://www.instagram.com",
            linkedin: "https://www.linkedin.com",
            terms: "<p>Default Terms and Conditions.</p>", // Added terms field
          };

          const newDocument = await db.GeneralData.create(dummyData);
          heroData = newDocument;
          toast.success("Dummy General Data created.");
        }

        setHeroSection(heroData);
      } catch (error) {
        console.error("Failed to fetch General Data:", error);
        toast.error("Failed to fetch General Data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroSection();
  }, []);

  // Function to get image URL
  const getImageURL = (imageId) => {
    if (!imageId) return null;
    // Assuming getFileDownload returns a URL string
    return storageServices.images.getFileDownload(imageId);
  };

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

  // Helper function to render no data animation
  const renderNoResultsAnimation = () => (
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

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Images" pageTitle="Images" />
        {isLoading ? (
          // Loading Indicator
          renderLoadingAnimation()
        ) : heroSection ? (
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="d-flex align-items-center">
                  <h4 className="card-title mb-0 flex-grow-1">Images</h4>
                  <div className="flex-shrink-0">
                    <Link
                      to={`/editgeneralimages/${heroSection.$id}`}
                      className="btn btn-primary"
                    >
                      Edit Images
                    </Link>
                  </div>
                </CardHeader>
                <CardBody>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>Logo Image</th>
                        <td>
                          {heroSection.logo ? (
                            <img
                              src={getImageURL(heroSection.logo)}
                              alt="Logo"
                              className="img-thumbnail"
                              style={{
                                maxHeight: "400px",
                                maxWidth: "700px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "No logo image uploaded."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Facebook</th>
                        <td>
                          {heroSection.facebook ? (
                            <a
                              href={
                                heroSection.facebook.startsWith("http")
                                  ? heroSection.facebook
                                  : `https://${heroSection.facebook}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {heroSection.facebook}
                            </a>
                          ) : (
                            "No Facebook link."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Twitter</th>
                        <td>
                          {heroSection.twitter ? (
                            <a
                              href={
                                heroSection.twitter.startsWith("http")
                                  ? heroSection.twitter
                                  : `https://${heroSection.twitter}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {heroSection.twitter}
                            </a>
                          ) : (
                            "No Twitter link."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Instagram</th>
                        <td>
                          {heroSection.instagram ? (
                            <a
                              href={
                                heroSection.instagram.startsWith("http")
                                  ? heroSection.instagram
                                  : `https://${heroSection.instagram}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {heroSection.instagram}
                            </a>
                          ) : (
                            "No Instagram link."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>LinkedIn</th>
                        <td>
                          {heroSection.linkedin ? (
                            <a
                              href={
                                heroSection.linkedin.startsWith("http")
                                  ? heroSection.linkedin
                                  : `https://${heroSection.linkedin}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {heroSection.linkedin}
                            </a>
                          ) : (
                            "No LinkedIn link."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Terms and Conditions</th>
                        <td>
                          {heroSection.terms ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: heroSection.terms,
                              }}
                            />
                          ) : (
                            "No Terms and Conditions provided."
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        ) : (
          // No Data Indicator
          renderNoResultsAnimation()
        )}
      </Container>
    </div>
  );
};

export default GeneralimagesList;
