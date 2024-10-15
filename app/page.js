"use client"

import { useEffect, useState, useRef } from "react";
import SaveIcon  from './images/save-svgrepo-com.svg';
import { Toaster, toast } from 'react-hot-toast';


export default function Home() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null); 
  const [newAddress, setNewAddress] = useState({
    line1: "",
    line2: "",
    state: "",
    city: "",
    pincode: ""
  });
  const dropdownRef = useRef(null);


  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CIRCOLIFE_CUSTOMER}`);
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          console.error("Failed to fetch data:", response.status);
        }
      } catch (error) {
        toast.error("Failed to fetch data: ", error);
        console.error("Error fetching data:", error);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers by name based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowDropdown(true); // Show dropdown when typing
    } else {
      setFilteredCustomers([]);
      setShowDropdown(false); // Hide dropdown when search term is empty
    }
  }, [searchTerm, customers]);

  const handleAddAddress = () => {
    if (newAddress) {
      const customer = { ...filteredCustomers[0] };
      
      if (!customer.shipping_address) {
        customer.shipping_address = [];
      }
  
      customer.shipping_address.push(newAddress);
  
      const updatedCustomers = [...filteredCustomers];
      updatedCustomers[0] = customer; // Replace the first customer with the updated one
      setFilteredCustomers(updatedCustomers);
  
      console.log('Updated filtered customers with new address:', updatedCustomers);
    }
  
    setNewAddress({
      line1: "",
      line2: "",
      state: "",
      city: "",
      pincode: ""
    });
    setShowModal(false);
  };

  const handleCustomerSelect = (customer, e) => {
    e.preventDefault();
    setSearchTerm(customer.name);
    setFilteredCustomers([customer]);
    setTimeout(() => {
      setShowDropdown(false);
    }, 0); // 0 milliseconds delay  
    document.activeElement.blur();
  };

  useEffect(() => {
    console.log('selected index:', selectedAddressIndex);
  }, [selectedAddressIndex]);


  const handleSubmit = async () => {
    try {
      if (selectedAddressIndex !== null && filteredCustomers[0]?.shipping_address) {
        const selectedAddress = filteredCustomers[0].shipping_address[selectedAddressIndex];
        const selectedCustomer = customers.find(customer => customer.name === searchTerm);
        console.log('selected customer', selectedCustomer);
        console.log("Selected Address to be sent:", selectedAddress);
        const customer_id = selectedCustomer.customer_id;
        let Fullname, mobile;
        const response = await fetch(`${process.env.NEXT_PUBLIC_CIRCOLIFE_API}/${customer_id}`)
        if (response.ok) {
          const data = await response.json(); // Parse the JSON response
          Fullname = data.Fullname;
          mobile = data.mobile;
        }

        console.log(Fullname, mobile);
        const taskData = {
          title: `Address Change`,
          status: "",
          description: `customer location mapping`,
          address: [
            {
              location: `${selectedAddress.line2}, ${selectedAddress.city}, ${selectedAddress.pincode}`
            }
          ],
          client_number: mobile,
          client_name: Fullname,
          ac_units: [
            {
              type: "Split AC",
              capacity: "1.5 Ton",
              quantity: 2
            },
            {
              type: "Cassete AC",
              capacity: "2 Ton",
              quantity: 1
            }
          ],
          servicingDate: "2024-09-26T00:00:00.000Z",  
          taskType: "address",  
          customerComplaint: "Any customer complaint here",
          issueObserved: "Water Dripping from AC",
          note: "Any additional notes here",
          complaintRaised: new Date().toISOString(),  
          assignedTechnicians: ["pranshi"]  
        };

        console.log('task data', taskData);
  
        const response2 = await fetch(`${process.env.NEXT_PUBLIC_SERVICE_API}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (response2.ok) {
          toast.success('task updated successfully!')
        } else {
          toast.error('Failed to update address:', response.status);
          console.error("Failed to update address:", response.status);
        }
      } else {
        toast.error("No address selected");
        console.log("No address selected");
      }
    } catch (err) {
      toast.error("Error Submitting data: ", err);
      console.error("Error submitting data:", err);
    }
  };

  return (
    <div className="lg:m-5 m-5">
      <Toaster />
      <section className="max-w-4xl p-6 mx-auto bg-white rounded-2xl shadow-xl dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">
          Customer Address Change
        </h2>

        <div>
          <div className="flex flex-col gap-6 mt-4 sm:grid-cols-2">
            <div className="relative">
              <label className="text-white dark:text-white font-bold text-xl" htmlFor="search">
                Search Customer by Name
              </label>
              <input
                id="search"
                type="text"
                ref={dropdownRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                placeholder="Type customer name..."
              />

              {showDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    {filteredCustomers.map((customer) => (
                      <li
                        key={customer._id}
                        onClick={(e) => handleCustomerSelect(customer, e)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                      >
                        {customer.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">
                Shipping Address
              </h2>
              {filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers[0].shipping_address.map((address, index) => (
                  <div key={index} className="max-w-sm p-6 bg-white rounded-lg shadow-md shadow-gray-800 dark:bg-gray-700 dark:border-gray-700 m-10">
                    <div>
                      <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105.67 116.43" width="50" height="50">
                        <defs><style>{`.cls-1{fill:#ffffff;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2{fill:#ef4136;}`}</style></defs>
                        <title>address</title>
                        <path class="cls-1" d="M84.32,80.09c13,3.68,21.35,9.56,21.35,16.19,0,11.13-23.65,20.15-52.83,20.15S0,107.41,0,96.28c0-6.79,8.79-12.79,22.27-16.44l1.48,2c1,1.37,2.13,2.73,3.26,4.06-9.43,2.28-15.47,5.8-15.47,9.75,0,6.88,18.29,12.46,40.86,12.46s40.86-5.58,40.86-12.46c0-3.67-5.24-7-13.56-9.26,1.64-2,3.18-4.14,4.62-6.3Z"/>
                        <path class="cls-2" d="M70.19,82.78A69.18,69.18,0,0,1,55.08,95.29a2.14,2.14,0,0,1-2.43.07,85,85,0,0,1-21-18.76C24,67,19.13,56.34,17.48,46.07s-.11-20.42,5.07-28.56a35,35,0,0,1,7.83-8.68C37.68,3,46-.06,54.34,0A34.89,34.89,0,0,1,83.15,16.68c5.57,9.17,6.77,20.87,4.33,32.72A71.93,71.93,0,0,1,70.19,82.75v0ZM52.76,18.51A17.88,17.88,0,1,1,34.88,36.38,17.87,17.87,0,0,1,52.76,18.51Z"/>
                      </svg>
                    </div>
                    <p className="mb-3 font-bold text-white font-mono dark:text-white mt-2">Address {index + 1}</p>
                    <div className="flex flex-col w-[100%] text-white text-sm">
                      <span>
                        Line 1: {address.line1}
                      </span>
                      <span>
                        Line 2: {address.line2}
                      </span>
                      <span>
                        State: {address.state}
                      </span>
                      <span>
                        City: {address.city}
                      </span>
                      <span>
                        Pincode: {address.pincode}
                      </span>
                    </div>
                    <div className="mt-auto pt-4">
                      <input
                        type="checkbox"
                        checked={selectedAddressIndex === index}
                        onChange={() => setSelectedAddressIndex(index)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="max-w-sm p-6 bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-700">
                  <p className="font-normal text-gray-500 dark:text-gray-400">No shipping address available.</p>
                  {/* <button className="max-w-sm bg-blue-700 text-white p-5 rounded-md drop-shadow-lg" onClick={() => setShowModal(!showModal)}>Add Address</button> */}
                </div>
              )}
              <button className="max-w-sm bg-blue-700 text-white p-5 rounded-md drop-shadow-lg mt-5" onClick={() => setShowModal(!showModal)}>Add Address</button>
            </div>

          </div>

          {showModal && (
            <div ref={dropdownRef} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <div className="bg-white rounded-lg p-6 shadow-2xl w-[40%]">
                <h3 className="text-lg font-semibold text-black">Add Shipping Address</h3>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Line 1"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                  />
                  <input
                    type="text"
                    placeholder="Line 2"
                    value={newAddress.line2}
                    onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                    className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md text-black"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md text-black"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md text-black"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleAddAddress}
                  >
                    <SaveIcon className="inline-block w-5 h-5 mr-2" /> 
                    Save
                  </button>
                  <button
                    className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
          
            <button className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
              onClick={() => handleSubmit()}
            >
              <SaveIcon className="inline-block w-5 h-5 mr-2" /> 
              Save
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
