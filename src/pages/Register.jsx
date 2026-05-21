import { useState } from "react";
import { useLocation } from "wouter";
import { fieldInputCls } from "../components/Fields";

export default function Register() {
	const [, navigate] = useLocation();
	const [office, setOffice] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	function handleSubmit(e) {
		e.preventDefault();
		// Basic client-side register behavior: store authed and go to dashboard
		localStorage.setItem("authed", "1");
		navigate("/dashboard");
	}

	return (
		<div className="flex h-screen">
			<div className="w-[46%] bg-navy flex flex-col justify-center p-10 shrink-0">
				<div className="text-white">
					<h1 className="text-4xl font-bold">Register your office</h1>
					<p className="mt-4 text-slate-400">Create an officer profile to use the BIR portal.</p>
				</div>
			</div>

			<div className="flex-1 bg-canvas flex items-center justify-center">
				<div className="w-[420px] bg-surface p-8 rounded-lg shadow">
					<h2 className="text-2xl font-bold mb-4">Create an account</h2>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">Office Name</label>
							<input value={office} onChange={(e) => setOffice(e.target.value)} className={fieldInputCls} />
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">Email</label>
							<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldInputCls} />
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">Password</label>
							<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldInputCls} />
						</div>
						<button type="submit" className="h-10 rounded bg-navy text-white text-sm font-semibold hover:opacity-90 transition-opacity">Register</button>
						<button type="button" onClick={() => navigate('/sign-in')} className="text-sm text-blue underline">Already have an account? Sign in</button>
					</form>
				</div>
			</div>
		</div>
	);
}
