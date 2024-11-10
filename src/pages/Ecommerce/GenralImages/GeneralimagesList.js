// src/pages/HeroSection/HeroSectionList.js

import React, { useEffect, useState } from "react";
import { Container, Row, Card, CardHeader, CardBody, Col } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Link } from "react-router-dom";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GeneralimagesList = () => {
  const [heroSection, setHeroSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        const response = await db.Generalimages.list();
        let heroData = response.documents[0];

        if (!heroData) {
          const dummyData = {
            title: "Dummy Title",
            subtitle: "Dummy Subtitle",
            imageId: "",
            loginImage: "",
          };
          const newDocument = await db.Generalimages.create(dummyData);
          heroData = newDocument;
          toast.success("Dummy Images created.");
        }

        setHeroSection(heroData);
      } catch (error) {
        console.error("Failed to fetch Images:", error);
        toast.error("Failed to fetch Images.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroSection();
  }, []);

  // Function to get image URL
  const getImageURL = (imageId) => {
    if (!imageId) return null;
    const imageUrlResponse = storageServices.images.getFilePreview(imageId);
    return imageUrlResponse.href;
  };

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Images" pageTitle="Images" />
        {isLoading ? (
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
                        <th>Login Image</th>
                        <td>
                          {heroSection.loginImage ? (
                            <img
                              src={getImageURL(heroSection.loginImage)}
                              alt="Login"
                              className="img-thumbnail"
                              style={{
                                width: "200px",
                                height: "200px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "No login image uploaded."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Wholesale Image</th>
                        <td>
                          {heroSection.wholesaleImage ? (
                            <img
                              src={getImageURL(heroSection.wholesaleImage)}
                              alt="Wholesale"
                              className="img-thumbnail"
                              style={{
                                width: "200px",
                                height: "200px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "No wholesale image uploaded."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Contact Image</th>
                        <td>
                          {heroSection.contactImage ? (
                            <img
                              src={getImageURL(heroSection.contactImage)}
                              alt="Contact"
                              className="img-thumbnail"
                              style={{
                                width: "200px",
                                height: "200px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "No contact image uploaded."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Policy Image</th>
                        <td>
                          {heroSection.policyImage ? (
                            <img
                              src={getImageURL(heroSection.policyImage)}
                              alt="Policy"
                              className="img-thumbnail"
                              style={{
                                width: "200px",
                                height: "200px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "No policy image uploaded."
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
              <h5>No Images Found</h5>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default GeneralimagesList;
