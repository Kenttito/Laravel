import React from 'react';

const PendingApproval = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Pending Approval</h3>
            </div>
            <div className="card-body">
              <p>Your account is pending approval. Please wait for admin verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval; 