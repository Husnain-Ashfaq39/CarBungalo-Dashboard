// src/pages/WholesaleRequests.js

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  Input,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import storageServices from '../../appwrite/Services/storageServices';
import db from '../../appwrite/Services/dbServices';
import { Query } from 'appwrite';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheck, faTimes, faUndo } from '@fortawesome/free-solid-svg-icons';
import TableContainer from '../../Components/Common/TableContainer';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/animations/loading.json';
import searchAnimation from '../../assets/animations/search.json';

const WholesaleRequests = () => {
  const [requests, setRequests] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('1');

  const [viewModal, setViewModal] = useState(false);
  const [selectedRequestForView, setSelectedRequestForView] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // AttachmentPreview Component
  const AttachmentPreview = ({ url, alt }) => {
    const [isImage, setIsImage] = useState(true);

    return (
      <div>
        {isImage ? (
          <>
            <img
              src={url}
              alt={alt}
              style={{ maxWidth: '100px', maxHeight: '100px' }}
              onError={() => setIsImage(false)}
            />
            <div>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </div>
          </>
        ) : (
          <>
            <div>Preview not available</div>
            <div>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </div>
          </>
        )}
      </div>
    );
  };

  // Fetch wholesale requests and user data
  const fetchWholesaleRequests = async () => {
    try {
      setLoading(true);
      // Fetch all requests with a high limit
      const response = await db.WholesaleAccountRequests.list([], 100);

      setRequests(response.documents);

      // Collect all userIds
      const userIds = response.documents.map((request) => request.userId);

      // Fetch user details for each userId in bulk
      const userListResponse = await db.Users.list(
        [Query.equal('userId', userIds)],
        100
      );

      
      // Build a map of userId to user data
      const usersMap = {};
      userListResponse.documents.forEach((user) => {
        usersMap[user.userId] = user;
      });

      // For userIds not found, assign default values
      userIds.forEach((userId) => {
        if (!usersMap[userId]) {
          console.error(`User with userId ${userId} not found.`);
          usersMap[userId] = { name: 'Unknown', email: '' };
        }
      });

      setUsersData(usersMap);
    } catch (error) {
      console.error('Error fetching wholesale requests:', error);
      toast.error('Failed to fetch wholesale requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWholesaleRequests();
  }, []);

  // Handle approving a wholesale request
  const handleApprove = async (request) => {
    try {
      // Update the request status to 'approved'
      await db.WholesaleAccountRequests.update(request.$id, {
        status: 'approved',
        rejectionReason: '', // Clear rejection reason
      });

      // Update the user's isWholesaleApproved property to true
      const userId = request.userId;
      const userList = await db.Users.list([Query.equal('userId', userId)]);
      if (userList.total > 0) {
        const userDocId = userList.documents[0].$id;
        await db.Users.update(userDocId, { isWholesaleApproved: true });
      } else {
        console.error(`User with userId ${userId} not found.`);
      }

      toast.success('Request approved successfully.');
      fetchWholesaleRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request.');
    }
  };

  // Handle rejecting a wholesale request
  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectModal(true);
  };

  // Confirm rejection, update the request status, and handle the rejection reason
  const confirmReject = async () => {
    try {
      // Update the request status and set the rejection reason
      await db.WholesaleAccountRequests.update(selectedRequest.$id, {
        status: 'rejected',
        rejectionReason: rejectReason || '',
      });

      // Update the user's isWholesaleApproved property to false
      const userId = selectedRequest.userId;
      const userList = await db.Users.list([Query.equal('userId', userId)]);
      if (userList.total > 0) {
        const userDocId = userList.documents[0].$id;
        await db.Users.update(userDocId, { isWholesaleApproved: false });
      } else {
        console.error(`User with userId ${userId} not found.`);
      }

      toast.success('Request rejected successfully.');
      setRejectModal(false);
      setRejectReason('');
      fetchWholesaleRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request.');
    }
  };

  // Handle viewing request details
  const handleViewDetails = (request) => {
    setSelectedRequestForView(request);
    setViewModal(true);
  };

  // Parse attachments and fetch file URLs
  const parseAttachments = async (attachmentsArray) => {
    if (!attachmentsArray || attachmentsArray.length === 0) return [];

    const files = await Promise.all(
      attachmentsArray.map(async (fileId, index) => {
        try {
          const fileViewUrl = storageServices['images'].getFileView(fileId);
          let key = '';
          if (index === 0) key = 'Photo ID';
          else if (index === 1) key = 'Utility Bill';
          else key = `Other Document ${index - 1}`;

          return { key, url: fileViewUrl.href };
        } catch (error) {
          console.error(`Error getting file ${fileId}:`, error);
          return { key: `Attachment ${index + 1}`, url: '' };
        }
      })
    );

    return files;
  };

  useEffect(() => {
    const fetchAttachments = async () => {
      if (selectedRequestForView && selectedRequestForView.attachments) {
        const files = await parseAttachments(selectedRequestForView.attachments);
        setAttachments(files);
      } else {
        setAttachments([]);
      }
    };

    fetchAttachments();
  }, [selectedRequestForView]);

  // Filter requests based on the active tab and search term
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    switch (activeTab) {
      case '1':
        // Pending
        filtered = requests.filter((request) => request.status === 'pending');
        break;
      case '2':
        // Approved
        filtered = requests.filter((request) => request.status === 'approved');
        break;
      case '3':
        // Rejected
        filtered = requests.filter((request) => request.status === 'rejected');
        break;
      default:
        filtered = requests;
    }

    // Apply search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((request) => {
        const user = usersData[request.userId];
        if (user && user.name) {
          return user.name.toLowerCase().includes(lowercasedSearchTerm);
        }
        return false;
      });
    }

    return filtered;
  }, [activeTab, requests, searchTerm, usersData]);

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        header: 'No.',
        cell: (cell) => cell.row.index + 1,
        id: 'serial',
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: 'User',
        id: 'user',
        accessorKey: 'userId',
        disableFilters: true,
        cell: ({ row }) => {
          const userId = row.original.userId;
          const user = usersData[userId];
          return user ? (
            <div>
              <div>{user.name}</div>
              <div>{user.email}</div>
            </div>
          ) : (
            'Loading...'
          );
        },
      },
      {
        header: 'First Name',
        accessorKey: 'firstName',
        disableFilters: true,
      },
      {
        header: 'Last Name',
        accessorKey: 'lastName',
        disableFilters: true,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        id: 'status',
        disableFilters: true,
        cell: ({ cell }) => {
          const status = cell.getValue();
          let badgeClass = '';
          switch (status) {
            case 'pending':
              badgeClass = 'badge bg-warning-subtle text-warning';
              break;
            case 'approved':
              badgeClass = 'badge bg-success-subtle text-success';
              break;
            case 'rejected':
              badgeClass = 'badge bg-danger-subtle text-danger';
              break;
            default:
              badgeClass = 'badge bg-secondary-subtle text-secondary';
          }
          return <span className={`${badgeClass}`}>{status}</span>;
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        disableFilters: true,
        cell: ({ row }) => {
          const request = row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item">
                <Button
                  color="link"
                  className="text-primary p-0"
                  onClick={() => handleViewDetails(request)}
                >
                  <FontAwesomeIcon icon={faEye} size="lg" />
                </Button>
              </li>
              {request.status === 'pending' && (
                <>
                  <li className="list-inline-item">
                    <Button
                      color="link"
                      className="text-success p-0"
                      onClick={() => handleApprove(request)}
                    >
                      <FontAwesomeIcon icon={faCheck} size="lg" />
                    </Button>
                  </li>
                  <li className="list-inline-item">
                    <Button
                      color="link"
                      className="text-danger p-0"
                      onClick={() => handleReject(request)}
                    >
                      <FontAwesomeIcon icon={faTimes} size="lg" />
                    </Button>
                  </li>
                </>
              )}
              {request.status === 'rejected' && (
                <li className="list-inline-item">
                  <Button
                    color="link"
                    className="text-secondary p-0"
                    onClick={() => handleApprove(request)}
                  >
                    <FontAwesomeIcon icon={faUndo} size="lg" />
                  </Button>
                </li>
              )}
              {request.status === 'approved' && (
                <li className="list-inline-item">
                  <Button
                    color="link"
                    className="text-danger p-0"
                    onClick={() => handleReject(request)}
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </Button>
                </li>
              )}
            </ul>
          );
        },
      },
    ],
    [usersData]
  );

  // Handle Tab Click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Updated Loading Animation
  const renderLoadingAnimation = () => {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
        <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} loop={true} />
        <div className="mt-3">
          <h5>Loading data!</h5>
        </div>
      </div>
    );
  };

  // No Results Animation
  const renderNoResultsAnimation = () => {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
        <Lottie animationData={searchAnimation} style={{ width: 150, height: 150 }} loop={true} />
        <div className="mt-3">
          <h5>No matching results found.</h5>
        </div>
      </div>
    );
  };

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        {/* Search Input */}
        <Row className="mb-3">
          <Col lg={4}>
            <Input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                {/* Tabs */}
                <Nav
                  className="nav-tabs nav-tabs-custom nav-success"
                  role="tablist"
                >
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '1' },
                        'fw-semibold'
                      )}
                      onClick={() => handleTabClick('1')}
                      href="#"
                    >
                      <i className="ri-time-line me-1 align-bottom"></i> Pending
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '2' },
                        'fw-semibold'
                      )}
                      onClick={() => handleTabClick('2')}
                      href="#"
                    >
                      <i className="ri-check-line me-1 align-bottom"></i> Approved
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '3' },
                        'fw-semibold'
                      )}
                      onClick={() => handleTabClick('3')}
                      href="#"
                    >
                      <i className="ri-close-line me-1 align-bottom"></i> Rejected
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>
              <CardBody>
                {loading ? (
                  // Use the new loading animation function
                  renderLoadingAnimation()
                ) : filteredRequests.length > 0 ? (
                  <TableContainer
                    columns={columns}
                    data={filteredRequests}
                    isGlobalFilter={false}
                    isFilter={false}
                    customPageSize={10}
                    divClass="table-responsive"
                    tableClass="table align-middle table-nowrap"
                    theadClass="table-light"
                    SearchPlaceholder=""
                  />
                ) : (
                  // Show search animation if no results
                  renderNoResultsAnimation()
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal}
        toggle={() => setRejectModal(!rejectModal)}
        centered
      >
        <ModalHeader toggle={() => setRejectModal(!rejectModal)}>
          Reject Request
        </ModalHeader>
        <ModalBody>
          <Form>
            <Label for="rejectReason">Reason for rejection (optional)</Label>
            <Input
              type="textarea"
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="text-end mt-3">
              <Button
                color="secondary"
                className="me-2"
                onClick={() => setRejectModal(false)}
              >
                Cancel
              </Button>
              <Button color="danger" onClick={confirmReject}>
                Reject
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewModal}
        toggle={() => setViewModal(!viewModal)}
        centered
        size="lg"
      >
        <ModalHeader toggle={() => setViewModal(!viewModal)}>
          Request Details
        </ModalHeader>
        <ModalBody>
          {selectedRequestForView ? (
            <Form>
              <Row>
                <Col md={6}>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    value={selectedRequestForView.firstName || ''}
                    readOnly
                  />
                </Col>
                <Col md={6}>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    value={selectedRequestForView.lastName || ''}
                    readOnly
                  />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={12}>
                  <Label>Address</Label>
                  <Input
                    type="textarea"
                    value={selectedRequestForView.address || ''}
                    readOnly
                  />
                </Col>
              </Row>
              {/* Display other fields as needed */}
              {/* For example: */}
              <Row className="mt-3">
                <Col md={6}>
                  <Label>Mobile Number</Label>
                  <Input
                    type="text"
                    value={selectedRequestForView.mobileNumber || ''}
                    readOnly
                  />
                </Col>
                <Col md={6}>
                  <Label>Account Type</Label>
                  <Input
                    type="text"
                    value={selectedRequestForView.accountType || ''}
                    readOnly
                  />
                </Col>
              </Row>
              {/* Display business details if accountType is 'business' */}
              {selectedRequestForView.accountType === 'business' && (
                <>
                  <Row className="mt-3">
                    <Col md={6}>
                      <Label>Trading Name</Label>
                      <Input
                        type="text"
                        value={selectedRequestForView.tradingName || ''}
                        readOnly
                      />
                    </Col>
                    <Col md={6}>
                      <Label>Company Registered Name</Label>
                      <Input
                        type="text"
                        value={selectedRequestForView.companyRegisteredName || ''}
                        readOnly
                      />
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={6}>
                      <Label>Company Registration Number</Label>
                      <Input
                        type="text"
                        value={selectedRequestForView.companyRegistrationNumber || ''}
                        readOnly
                      />
                    </Col>
                    <Col md={6}>
                      <Label>Position in Business</Label>
                      <Input
                        type="text"
                        value={selectedRequestForView.positionInBusiness || ''}
                        readOnly
                      />
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={12}>
                      <Label>Business Description</Label>
                      <Input
                        type="textarea"
                        value={selectedRequestForView.businessDescription || ''}
                        readOnly
                      />
                    </Col>
                  </Row>
                  {/* Additional business fields */}
                </>
              )}
              {/* Display attachments */}
              <Label className="mt-3">Attachments</Label>
              {attachments.length > 0 ? (
                <div>
                  {attachments.map((attachment, index) => (
                    <div key={index} className="mb-3">
                      <Label>{attachment.key}</Label>
                      <AttachmentPreview url={attachment.url} alt={attachment.key} />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No attachments</p>
              )}
            </Form>
          ) : (
            <div>Loading...</div>
          )}
        </ModalBody>
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setViewModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default WholesaleRequests;
