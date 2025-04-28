
import React, { useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type SignatureFieldProps = {
  onSave: (signature: string | null) => void;
};

const SignatureField: React.FC<SignatureFieldProps> = ({ onSave }) => {
  const signatureRef = useRef<SignatureCanvas | null>(null);

  const handleSignatureSave = () => {
    if (signatureRef.current) {
      onSave(signatureRef.current.getTrimmedCanvas().toDataURL('image/png'));
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onSave(null);
    }
  };

  return (
    <div className="mb-6">
      <Label>Signature</Label>
      <div className="border rounded-md p-2">
        <SignatureCanvas
          ref={signatureRef}
          penColor='black'
          backgroundColor='white'
          canvasProps={{ width: 500, height: 200, className: 'border' }}
        />
        <div className="flex justify-between mt-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleClearSignature}>
            Clear
          </Button>
          <Button type="button" size="sm" onClick={handleSignatureSave}>
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignatureField;
