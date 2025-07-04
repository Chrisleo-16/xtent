
import { useMemo, useState } from 'react';
import { useVerification, ProfileWithRole } from '@/hooks/useVerification';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import DocumentUploader from './DocumentUploader';

const texts = {
    en: {
        title: "Account Verification",
        description: "To ensure security and trust on our platform, please upload the required documents. Your information is kept secure and private.",
        status: "Verification Status",
        unverified: "Unverified. Please upload your documents to start.",
        pending: "Pending Review. Your documents have been submitted and are awaiting review.",
        verified: "Verified. Your account is fully verified.",
        rejected: "Rejected. Please review the reason and resubmit.",
        rejectionReason: "Rejection Reason",
        nationalId: "National ID",
        nationalIdSw: "Kitambulisho cha Taifa",
        propertyDeed: "Property Deed",
        propertyDeedSw: "Hati ya Mali",
        submitRequest: "Submit Verification Request",
        requestSubmitted: "Request Submitted",
        alreadyVerified: "Your account is already verified. No further action is needed.",
        loading: "Loading verification status...",
        error: "Could not load verification information. Please try again later.",
        documentsNeeded: "You need to upload all required documents before submitting a request.",
    },
    sw: {
        title: "Uthibitishaji wa Akaunti",
        description: "Ili kuhakikisha usalama na uaminifu kwenye jukwaa letu, tafadhali pakia stakabadhi zinazohitajika. Taarifa zako ziko salama na ni za faragha.",
        status: "Hali ya Uthibitishaji",
        unverified: "Haijathibitishwa. Tafadhali pakia stakabadhi zako ili kuanza.",
        pending: "Inasubiri Uhakiki. Stakabadhi zako zimewasilishwa na zinasubiri kukaguliwa.",
        verified: "Imethibitishwa. Akaunti yako imethibitishwa kikamilifu.",
        rejected: "Imekataliwa. Tafadhali angalia sababu na uwasilishe tena.",
        rejectionReason: "Sababu ya Kukataliwa",
        nationalId: "National ID",
        nationalIdSw: "Kitambulisho cha Taifa",
        propertyDeed: "Property Deed",
        propertyDeedSw: "Hati ya Mali",
        submitRequest: "Tuma Ombi la Uthibitishaji",
        requestSubmitted: "Ombi Limetumwa",
        alreadyVerified: "Akaunti yako tayari imethibitishwa. Hakuna hatua zaidi inayohitajika.",
        loading: "Inapakia hali ya uthibitishaji...",
        error: "Imeshindwa kupakia taarifa za uthibitishaji. Tafadhali jaribu tena baadaye.",
        documentsNeeded: "Unahitaji kupakia nyaraka zote zinazohitajika kabla ya kuwasilisha ombi.",
    }
};

const VerificationStatusBadge = ({ profile, lang }: { profile: ProfileWithRole, lang: 'en' | 'sw' }) => {
    const status = profile.verification_status;
    
    const statusConfig = {
        unverified: {
            icon: <ShieldAlert className="h-5 w-5 text-yellow-500" />,
            text: texts[lang].unverified,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        },
        pending: {
            icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
            text: texts[lang].pending,
            color: 'bg-blue-50 border-blue-200 text-blue-800'
        },
        verified: {
            icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
            text: texts[lang].verified,
            color: 'bg-green-50 border-green-200 text-green-800'
        },
        rejected: {
            icon: <ShieldX className="h-5 w-5 text-red-500" />,
            text: texts[lang].rejected,
            color: 'bg-red-50 border-red-200 text-red-800'
        },
    };

    const config = statusConfig[status];

    return (
        <Alert className={config.color}>
            {config.icon}
            <AlertTitle className="ml-2">{texts[lang].status}</AlertTitle>
            <AlertDescription className="ml-2">
                {config.text}
                {status === 'rejected' && profile.rejection_reason && (
                    <p className="mt-1"><strong>{texts[lang].rejectionReason}:</strong> {profile.rejection_reason}</p>
                )}
            </AlertDescription>
        </Alert>
    );
};

const VerificationForm = () => {
    const { profile, isLoadingProfile, documents, isLoadingDocuments, uploadDocument, isUploading, deleteDocument, isDeleting, requestVerification, isSubmitting } = useVerification();
    const [lang, setLang] = useState<'en' | 'sw'>('en');

    const nationalIdDoc = useMemo(() => documents?.find(d => d.document_type === 'national_id'), [documents]);
    const propertyDeedDoc = useMemo(() => documents?.find(d => d.document_type === 'property_deed'), [documents]);

    const handleFileUpload = async (file: File, documentType: string) => {
        if (!profile) return;
        await uploadDocument({ file, documentType, userId: profile.id });
    };
    
    const handleFileDelete = async (doc: typeof nationalIdDoc) => {
        if (!doc) return;
        await deleteDocument({ documentId: doc.id, filePath: doc.file_path });
    };

    const requiredDocsUploaded = useMemo(() => {
        if (!profile) return false;
        if (profile.primary_role === 'landlord') {
            return !!nationalIdDoc && !!propertyDeedDoc;
        }
        return !!nationalIdDoc;
    }, [profile, nationalIdDoc, propertyDeedDoc]);
    
    const canSubmit = !isSubmitting && requiredDocsUploaded && (profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected');

    if (isLoadingProfile || isLoadingDocuments) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <span>{texts[lang].loading}</span></div>;
    }

    if (!profile) {
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{texts[lang].error}</AlertDescription></Alert>;
    }
    
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">{texts[lang].title}</CardTitle>
                        <CardDescription>{texts[lang].description}</CardDescription>
                    </div>
                    <div className="flex gap-1 border p-1 rounded-lg">
                        <Button size="sm" variant={lang === 'en' ? 'secondary' : 'ghost'} onClick={() => setLang('en')}>EN</Button>
                        <Button size="sm" variant={lang === 'sw' ? 'secondary' : 'ghost'} onClick={() => setLang('sw')}>SW</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <VerificationStatusBadge profile={profile} lang={lang} />
                
                {profile.verification_status !== 'verified' ? (
                    <div className="space-y-4">
                        <DocumentUploader
                            documentType="national_id"
                            documentName={{ en: texts.en.nationalId, sw: texts.sw.nationalIdSw }}
                            onFileUpload={(file) => handleFileUpload(file, 'national_id')}
                            onFileDelete={() => handleFileDelete(nationalIdDoc)}
                            isUploading={isUploading}
                            isDeleting={isDeleting}
                            uploadedFile={nationalIdDoc ? { name: nationalIdDoc.file_path.split('/').pop()! } : null}
                            lang={lang}
                        />

                        {profile.primary_role === 'landlord' && (
                             <DocumentUploader
                                documentType="property_deed"
                                documentName={{ en: texts.en.propertyDeed, sw: texts.sw.propertyDeedSw }}
                                onFileUpload={(file) => handleFileUpload(file, 'property_deed')}
                                onFileDelete={() => handleFileDelete(propertyDeedDoc)}
                                isUploading={isUploading}
                                isDeleting={isDeleting}
                                uploadedFile={propertyDeedDoc ? { name: propertyDeedDoc.file_path.split('/').pop()! } : null}
                                lang={lang}
                            />
                        )}
                    </div>
                ) : (
                    <Alert className="bg-green-50 border-green-200">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <AlertTitle>{texts[lang].verified}</AlertTitle>
                        <AlertDescription>{texts[lang].alreadyVerified}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            {profile.verification_status !== 'verified' && profile.verification_status !== 'pending' && (
                <CardFooter className="flex flex-col items-stretch gap-4">
                    {!requiredDocsUploaded && (
                         <p className="text-sm text-center text-yellow-600">{texts[lang].documentsNeeded}</p>
                    )}
                    <Button onClick={() => requestVerification()} disabled={!canSubmit} className="bg-green-600 hover:bg-green-700">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? texts[lang].requestSubmitted : texts[lang].submitRequest}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default VerificationForm;
