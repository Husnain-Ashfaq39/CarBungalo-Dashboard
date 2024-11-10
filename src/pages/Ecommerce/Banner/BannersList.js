import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Row,
  Card,
  CardHeader,
  CardBody,
  Col,
  Button,
} from "reactstrap";
import DeleteModal from "../../../Components/Common/DeleteModal";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import { Link } from "react-router-dom";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import { Query } from "appwrite"; // Import the Query from Appwrite
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BannersList = () => {
  const [bannersList, setBannersList] = useState([]);
  const [cursor, setCursor] = useState(null); // State for pagination cursor
  const [hasMore, setHasMore] = useState(true); // State to track if more banners are available
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const limit = 100; // Set limit to a larger value to fetch more banners

  useEffect(() => {
    const fetchBanners = async () => {
      if (!hasMore) return; // If no more banners are available, stop fetching

      try {
        setIsLoading(true);

        const queries = [Query.limit(limit)];
        if (cursor) {
          queries.push(Query.cursorAfter(cursor)); // Pagination handling
        }

        const response = await db.banners.list(queries);
        const banners = response.documents || [];
        
        if (banners.length < limit) {
          setHasMore(false); // If fetched data is less than limit, we have reached the end
        }

        if (banners.length > 0) {
          setCursor(banners[banners.length - 1].$id); // Set the cursor for the next batch
        }

        setBannersList((prev) => [...prev, ...banners]); // Append new banners to the list

      } catch (error) {
        console.error("Failed to fetch banners:", error);
        toast.error("Failed to fetch banners");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, [cursor, hasMore]);

  const onClickDelete = (banner) => {
    setBannerToDelete(banner);
    setDeleteModal(true);
  };

  const handleDeleteBanner = async () => {
    if (bannerToDelete) {
      try {
        if (bannerToDelete.imageId) {
          await storageServices.images.deleteFile(bannerToDelete.imageId);
        }
        await db.banners.delete(bannerToDelete.$id);
        setDeleteModal(false);
        setBannersList(bannersList.filter((b) => b.$id !== bannerToDelete.$id));
        toast.success("Banner deleted successfully");
      } catch (error) {
        console.error("Failed to delete banner:", error);
        toast.error("Failed to delete banner");
      }
    }
  };

  const getImageURL = (imageId) => {
    if (!imageId) return null;
    const imageUrlResponse = storageServices.images.getFilePreview(imageId);
    return imageUrlResponse.href;
  };

  const columns = useMemo(
    () => [
      { header: "S/N", id: "serialNumber", cell: (info) => info.row.index + 1 },
      {
        header: "Image",
        accessorKey: "imageId",
        id: "image",
        cell: (info) => (
          <img
            src={getImageURL(info.row.original.imageId)}
            alt="Banner"
            className="img-thumbnail"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        ),
      },
      { header: "Title", accessorKey: "title" },
      { header: "Subtitle", accessorKey: "subtitle" },
      {
        header: "Actions",
        id: "actions",
        cell: (info) => {
          const bannerData = info.row.original;
          return (
            <UncontrolledDropdown>
              <DropdownToggle href="#" className="btn btn-soft-secondary btn-sm" tag="button">
                <i className="ri-more-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem tag={Link} to={`/editbanner/${bannerData.$id}`}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
                </DropdownItem>
                <DropdownItem href="#" onClick={() => onClickDelete(bannerData)}>
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i> Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteBanner} onCloseClick={() => setDeleteModal(false)} />
      <Container fluid>
        <BreadCrumb title="Banners" pageTitle="Banners" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center">
                <h4 className="card-title mb-0 flex-grow-1">Banners List</h4>
                <div className="flex-shrink-0">
                  <Link to="/addbanner" className="btn btn-primary">Add Banner</Link>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading && bannersList.length === 0 ? (
                  <div className="py-4 text-center">
                    <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" colors="primary:#405189,secondary:#0ab39c" style={{ width: "72px", height: "72px" }}></lord-icon>
                    <div className="mt-4"><h5>Loading data!</h5></div>
                  </div>
                ) : bannersList && bannersList.length > 0 ? (
                  <>
                    <TableContainer
                      columns={columns}
                      data={bannersList}
                      isGlobalFilter={true}
                      customPageSize={10}
                      divClass="table-responsive mb-1"
                      tableClass="mb-0 align-middle table-borderless"
                      theadClass="table-light text-muted"
                      SearchPlaceholder="Search Banners..."
                      globalFilterFn="fuzzy"
                      filterFields={["title", "subtitle"]}
                    />
                    {hasMore && (
                      <div className="d-flex justify-content-center mt-3">
                        <Button color="primary" onClick={() => setCursor(cursor)} disabled={isLoading}>
                          {isLoading ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" colors="primary:#405189,secondary:#0ab39c" style={{ width: "72px", height: "72px" }}></lord-icon>
                    <div className="mt-4"><h5>No Banners Found</h5></div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BannersList;
