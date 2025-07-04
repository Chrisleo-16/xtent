
import { VerificationForm } from "@/components/verification";
import XtentLogo from "@/components/XtentLogo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const VerificationPage = () => {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 min-h-screen">
             <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 border-b border-gray-200">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center">
                        <XtentLogo />
                    </Link>
                    <Link to="/settings">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Settings
                        </Button>
                    </Link>
                </div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                            Account Verification
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Secure your account and unlock all XTENT features by completing the verification process below.
                        </p>
                    </div>
                    <VerificationForm />
                </div>
            </main>
        </div>
    );
};

export default VerificationPage;
