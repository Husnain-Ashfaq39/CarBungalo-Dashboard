import React, { useState, useEffect } from 'react';
import { Col, Row } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../appwrite/Services/authServices';

const Section = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        getCurrentUser()
            .then(user => setUserName(user.name || user.email?.split('@')[0] || "User"))
            .catch(() => setUserName("User"));
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
        return `Good ${greeting}, ${userName}!`;
    };

    return (
        <Row className="mb-3 pb-1">
            <Col xs={12}>
                <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                    <div className="flex-grow-1">
                        <h4 className="fs-16 mb-1">{getGreeting()}</h4>
                        <p className="text-muted mb-0">Here's what's happening with your store today.</p>
                    </div>
                    <div className="mt-3 mt-lg-0">
                        <Row className="g-3 mb-0 align-items-center">
                            <div className="col-auto">
                                <button 
                                    type="button" 
                                    className="btn btn-soft-success"
                                    onClick={() => navigate('/apps-ecommerce-add-product')}
                                >
                                    <i className="ri-add-circle-line align-middle me-1"></i> Add Product
                                </button>
                            </div>
                        </Row>
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default Section;
