import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import {
    FiUser,
    FiPhone,
    FiMapPin,
    FiSave,
    FiPlus,
    FiTrash2,
    FiCheckCircle,
    FiAlertCircle,
} from "react-icons/fi";
import "./ProfilePage.css";
import { digitsOnly, validateAddress, validateName } from "../../utils/validation";

const BASE_URL =
    import.meta.env?.VITE_API_URL ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
    "https://dilkushabackend.onrender.com/api";

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate(); // 2. Initialize navigate function

    const [name, setName] = useState("");
    const [addresses, setAddresses] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    // field errors appear after a field is left, or for everything on save
    const [touched, setTouched] = useState({});
    const [triedSave, setTriedSave] = useState(false);

    const nameError = validateName(name);
    const addressErrors = addresses.map((addr) => validateAddress(addr));
    const showError = (key, msg) => (triedSave || touched[key] ? msg : "");
    const touch = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

    const fieldProps = (key, msg) => ({
        id: key,
        onBlur: touch(key),
        "aria-invalid": showError(key, msg) ? true : undefined,
        "aria-describedby": showError(key, msg) ? `${key}-error` : undefined,
    });

    const fieldError = (key, msg) =>
        showError(key, msg) ? (
            <small id={`${key}-error`} className="field-error" role="alert">
                {showError(key, msg)}
            </small>
        ) : null;

    // Sync state when user context is loaded or updated
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            const syncedAddresses = (user.addresses || []).map((addr, idx) => ({
                ...addr,
                _id: addr._id || addr.id || `addr-${Date.now()}-${idx}`,
            }));
            setAddresses(syncedAddresses);
        }
    }, [user]);

    const handleAddressChange = (index, field, value) => {
        if (field === "pincode") value = digitsOnly(value, 6);
        setAddresses((prevAddresses) =>
            prevAddresses.map((addr, i) =>
                i === index ? { ...addr, [field]: value } : addr
            )
        );
    };

    const handleAddAddress = () => {
        const newAddress = {
            _id: `temp-${Date.now()}`,
            street: "",
            city: "",
            state: "",
            pincode: "",
            isDefault: addresses.length === 0,
        };
        setAddresses((prev) => [...prev, newAddress]);
    };

    const handleRemoveAddress = (index) => {
        setAddresses((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            if (prev[index]?.isDefault && updated.length > 0) {
                updated[0].isDefault = true;
            }
            return updated;
        });
    };

    const handleSetDefaultAddress = (index) => {
        setAddresses((prev) =>
            prev.map((addr, i) => ({
                ...addr,
                isDefault: i === index,
            }))
        );
    };

    // Form submission handler
    const handleUpdate = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setTriedSave(true);
        const firstBad = nameError
            ? "name"
            : (() => {
                const i = addressErrors.findIndex((errs) => Object.keys(errs).length);
                return i === -1 ? null : `addr-${i}-${Object.keys(addressErrors[i])[0]}`;
            })();
        if (firstBad) {
            setMessage("Please fix the highlighted fields before saving.");
            setMessageType("error");
            document.getElementById(firstBad)?.focus();
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setMessage("Session expired. Please login again.");
                setMessageType("error");
                setLoading(false);
                // Redirect to login if token is missing
                setTimeout(() => navigate("/login"), 1500);
                return;
            }

            const sanitizedAddresses = addresses.map(({ _id, ...rest }) =>
                _id?.startsWith("temp-") ? rest : { _id, ...rest }
            );

            const res = await axios.put(
                `${BASE_URL}/user/profile`,
                { name, addresses: sanitizedAddresses },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data?.success) {
                const updatedUser = res.data.user || {
                    ...user,
                    name,
                    addresses: sanitizedAddresses,
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));
                if (setUser) setUser(updatedUser);

                setMessage("Your profile has been updated successfully!");
                setMessageType("success");

                // 3. REDIRECT AFTER SUCCESS
                // Option A: Instant redirect
                // navigate("/dashboard");

                // Option B: Redirect after 1.5s delay so user sees success message
                setTimeout(() => {
                    navigate("/"); // Change '/dashboard' to your target route (e.g., '/', '/home', '/checkout')
                }, 1500);
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setMessage(
                err?.response?.data?.message || "Failed to update profile. Try again."
            );
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const getInitial = () => {
        if (name) return name.charAt(0).toUpperCase();
        if (user?.phone) return user.phone.charAt(0);
        return "U";
    };

    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

    return (
        <div className="profile-page" data-no-reveal>
            <div className="profile-header">
                <h1>My Profile</h1>
                <p>Manage your personal information and delivery details</p>
            </div>

            <div className="profile-card">
                <div className="profile-top">
                    <div className="profile-avatar">{getInitial()}</div>

                    <div className="profile-user-info">
                        <h2>{name || "Customer Account"}</h2>
                        <p>+91 {user?.phone || "Not provided"}</p>
                        <span className="account-badge">
                            <FiCheckCircle size={14} /> Active Account
                        </span>
                    </div>
                </div>

                <div className="profile-divider"></div>

                {message && (
                    <div
                        key={message}
                        role={messageType === "success" ? "status" : "alert"}
                        className={`profile-alert ${messageType === "success" ? "success-alert" : "error-alert"
                            }`}
                    >
                        {messageType === "success" ? (
                            <FiCheckCircle size={18} />
                        ) : (
                            <FiAlertCircle size={18} />
                        )}
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleUpdate}>
                    <div className="section-heading">
                        <div className="section-icon">
                            <FiUser size={18} />
                        </div>
                        <div>
                            <h3>Personal Information</h3>
                            <p>Update your basic account information</p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className={`input-wrapper ${showError("name", nameError) ? "is-invalid" : ""}`}>
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    {...fieldProps("name", nameError)}
                                />
                            </div>
                            {fieldError("name", nameError)}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-wrapper disabled-input">
                                <FiPhone className="input-icon" />
                                <input
                                    id="phone"
                                    type="text"
                                    value={user?.phone || ""}
                                    disabled
                                    placeholder="Phone number"
                                />
                            </div>
                            <small>Phone number cannot be changed.</small>
                        </div>
                    </div>

                    <div className="section-heading address-heading">
                        <div className="section-icon">
                            <FiMapPin size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3>Delivery Addresses</h3>
                            <p>Add and manage your shipping addresses</p>
                        </div>
                        <button
                            type="button"
                            className="add-address-btn"
                            onClick={handleAddAddress}
                        >
                            <FiPlus size={14} /> Add Address
                        </button>
                    </div>

                    {addresses.length === 0 ? (
                        <p className="address-empty">
                            No addresses added yet. Click "Add Address" to create one.
                        </p>
                    ) : (
                        addresses.map((addr, index) => (
                            <div
                                key={addr._id || index}
                                className={`address-card ${addr.isDefault ? "is-default" : ""}`}
                            >
                                <div className="address-card-top">
                                    <label className="address-default">
                                        <input
                                            type="radio"
                                            name="defaultAddress"
                                            checked={addr.isDefault || false}
                                            onChange={() => handleSetDefaultAddress(index)}
                                        />
                                        {addr.isDefault ? "Default Address" : "Set as Default"}
                                    </label>

                                    <button
                                        type="button"
                                        className="address-remove"
                                        onClick={() => handleRemoveAddress(index)}
                                    >
                                        <FiTrash2 size={14} /> Remove
                                    </button>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group form-group-wide">
                                        <label htmlFor={`addr-${index}-street`}>Street / Building / Area</label>
                                        <div
                                            className={`input-wrapper ${showError(`addr-${index}-street`, addressErrors[index]?.street) ? "is-invalid" : ""}`}
                                        >
                                            <FiMapPin className="input-icon" />
                                            <input
                                                type="text"
                                                autoComplete="address-line1"
                                                value={addr.street || ""}
                                                onChange={(e) =>
                                                    handleAddressChange(index, "street", e.target.value)
                                                }
                                                placeholder="House no., street, area"
                                                {...fieldProps(`addr-${index}-street`, addressErrors[index]?.street)}
                                            />
                                        </div>
                                        {fieldError(`addr-${index}-street`, addressErrors[index]?.street)}
                                    </div>

                                    {[
                                        { field: "city", label: "City", placeholder: "City", autoComplete: "address-level2" },
                                        { field: "state", label: "State (optional)", placeholder: "State", autoComplete: "address-level1" },
                                        { field: "pincode", label: "Pincode", placeholder: "6-digit pincode", autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 },
                                    ].map(({ field, label, ...inputProps }) => {
                                        const key = `addr-${index}-${field}`;
                                        const msg = addressErrors[index]?.[field];
                                        return (
                                            <div className="form-group" key={field}>
                                                <label htmlFor={key}>{label}</label>
                                                <input
                                                    type="text"
                                                    className={`profile-plain-input ${showError(key, msg) ? "is-invalid" : ""}`}
                                                    value={addr[field] || ""}
                                                    onChange={(e) => handleAddressChange(index, field, e.target.value)}
                                                    {...inputProps}
                                                    {...fieldProps(key, msg)}
                                                />
                                                {fieldError(key, msg)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    <div className="form-actions">
                        <button type="submit" className="save-button" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <FiSave size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="account-info-card">
                <div className="account-info-header">
                    <h3>Account Information</h3>
                    <span>Secure</span>
                </div>

                <div className="account-info-grid">
                    <div className="account-info-item">
                        <span className="info-label">Account Name</span>
                        <strong>{name || "Not provided"}</strong>
                    </div>

                    <div className="account-info-item">
                        <span className="info-label">Phone</span>
                        <strong>{user?.phone || "Not provided"}</strong>
                    </div>

                    <div className="account-info-item">
                        <span className="info-label">Primary City</span>
                        <strong>{defaultAddr?.city || "Not provided"}</strong>
                    </div>

                    <div className="account-info-item">
                        <span className="info-label">Account Status</span>
                        <strong className="status-active">
                            {user?.status === "active" || user?.status === undefined
                                ? "Active"
                                : "Disabled"}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;