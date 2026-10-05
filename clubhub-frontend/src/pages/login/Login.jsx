import { useState } from "react";
import {
    Eye,
    EyeOff,
    ArrowRight,
    GraduationCap,
    Building2
} from "lucide-react";

import { login } from "../../services/authService";
import AeroShards from "../../components/AeroShards/AeroShards";
import BorderGlow from "../../components/BorderGlow/BorderGlow";
import TextType from "../../components/TextType/TextType";
import SpecularButton from "../../components/SpecularButton/SpecularButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";

function Login() {
    const [role, setRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await login(
                identifier,
                password,
                role
            );

            signIn(data, keepSignedIn);

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* Background */}
            <div className="login-background">
                <AeroShards
                    backgroundColor="#120F17"
                    shardColor="#896ABD"
                    accentColor="#A855F7"
                    placement="full"
                    flow="stream"
                    material="chrome"
                    detail="fine"
                    effect="none"
                    scale={1.25}
                    spread={1.1}
                    depth={1.1}
                    speed={0.5}
                    spin={0.95}
                    interaction="repel"
                    density={1.5}
                    shardSize={1.2}
                    stretch={1}
                    turbulence={1}
                    glow={1.65}
                    edgeSoftness={2}
                    bloom={0.45}
                    grain={0.05}
                    chromaticAberration={0.0075}
                    transitionDuration={0.95}
                    interactionRadius={1.5}
                    interactionStrength={0.4}
                    rippleIntensity={1}
                    holdToGather
                    paused={false}
                />
            </div>

            {/* Login Card */}
            <BorderGlow
                className="login-card-glow"
                backgroundColor="#F7F6FA"
                borderRadius={20}
                glowColor="270 100 75"
                glowRadius={38}
                glowIntensity={1.5}
                edgeSensitivity={15}
                coneSpread={35}
                animated={false}
                colors={[
                    "#A855F7",
                    "#7C3AED",
                    "#60A5FA"
                ]}
                fillOpacity={0.18}
            >

                <div className="login-container">

                    {/* Brand */}
                    <div className="brand">
                        <div className="logo">
                            C
                        </div>

                        <span>
                            ClubHub
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className="login-heading">

                        <TextType
                            text="Manage your "
                            as="span"
                            typingSpeed={55}
                            initialDelay={500}
                            loop={false}
                            showCursor={false}
                            className="heading-dark"
                        />

                        <TextType
                            text="clubs, your way."
                            as="span"
                            typingSpeed={55}
                            initialDelay={1050}
                            loop={false}
                            showCursor={false}
                            className="heading-purple"
                        />

                    </h1>

                    {/* Subtitle */}
                    <p className="subtitle">
                        Sign in to your ClubHub account
                    </p>

                    {/* Form */}
                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >

                        {/* Role Toggle */}
                        <div className="role-toggle">

                            <button
                                type="button"
                                className={
                                    role === "student"
                                        ? "active"
                                        : ""
                                }
                                onClick={() => {
                                    setRole("student");
                                    setError("");
                                }}
                            >
                                <GraduationCap size={18} />
                                Student
                            </button>

                            <button
                                type="button"
                                className={
                                    role === "faculty"
                                        ? "active"
                                        : ""
                                }
                                onClick={() => {
                                    setRole("faculty");
                                    setError("");
                                }}
                            >
                                <Building2 size={18} />
                                Faculty
                            </button>

                        </div>

                        {/* Identifier */}
                        <label>
                            {role === "student"
                                ? "Email / Register Number"
                                : "Email / Faculty ID"}
                        </label>

                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) =>
                                setIdentifier(e.target.value)
                            }
                            placeholder={
                                role === "student"
                                    ? "s.name@statecollege.edu"
                                    : "faculty@statecollege.edu"
                            }
                            required
                        />

                        {/* Password Label */}
                        <div className="password-label">

                            <label>
                                Password
                            </label>

                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();

                                    alert(
                                        "Password reset will be added later."
                                    );
                                }}
                            >
                                Forgot password?
                            </a>

                        </div>

                        {/* Password Input */}
                        <div className="password-input">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>

                        </div>

                        {/* Remember Me */}
                        <label className="remember">

                            <input
                                type="checkbox"
                                checked={keepSignedIn}
                                onChange={(e) =>
                                    setKeepSignedIn(
                                        e.target.checked
                                    )
                                }
                            />

                            <span>
                                Keep me signed in
                            </span>

                        </label>

                        {/* Error */}
                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        {/* Specular Sign In Button */}
                        <SpecularButton
                            type="submit"
                            size="lg"
                            radius={10}
                            tint="#7C22FF"
                            tintOpacity={0.95}
                            blur={0}
                            textColor="#FFFFFF"
                            lineColor="#FFFFFF"
                            baseColor="#7C22FF"
                            intensity={1.5}
                            shineSize={12}
                            shineFade={35}
                            thickness={1.2}
                            speed={0.35}
                            followMouse={true}
                            proximity={250}
                            autoAnimate={false}
                            disabled={loading}
                            className="login-specular-button"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}

                            {!loading && (
                                <ArrowRight size={18} />
                            )}

                        </SpecularButton>

                    </form>

                </div>

            </BorderGlow>

        </div>
    );
}

export default Login;
