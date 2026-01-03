import React, { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { Eye, EyeOff } from "lucide-react";

const FormInput = ({
  icon: Icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  className = "mb-3",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <Form.Group className={className}>
      <InputGroup>
        {Icon && (
          <InputGroup.Text className="bg-white">
            <Icon size={18} />
          </InputGroup.Text>
        )}
        
        <Form.Control
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value} 
          onChange={onChange}
          {...props} 
        />

        {isPasswordType && (
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            type="button" 
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )}
      </InputGroup>
    </Form.Group>
  );
};

export default FormInput;