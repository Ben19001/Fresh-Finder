import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const StorePage = () => {
  const location = useLocation();
  const { stores } = location.state || {}; // Get stores passed from SearchPage or frontendData from backend

  const [storeList, setStoreList] = useState([]);

  useEffect(() => {
    if (stores) {
      setStoreList(stores); // Set the stores data passed from the previous page
    }
  }, [stores]);

  if (!storeList.length) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Store Listings</h1>
      <div>
        {storeList.map((store, index) => (
          <div key={index}>
            <h2>{store.name}</h2>
            <p>AI Score: {store.score}</p>
            <p>Location: {store.location.address1}, {store.location.city}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorePage;
