# FlashFusion Component Structure & Boundaries

## Directory Layout

```
frontend/src/
├── components/           # UI Components
│   ├── WizardLayout.tsx     # Main wizard wrapper with step navigation
│   ├── StepPlatform.tsx     # Platform selection step
│   ├── StepConfigure.tsx    # Configuration step
│   ├── StepFeatures.tsx     # Features selection step
│   ├── StepDeploy.tsx       # Deployment configuration step
│   ├── StepGenerate.tsx     # Generation progress and results
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Progress.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── LoadingSpinner.tsx
│   ├── forms/               # Form-specific components
│   │   ├── PlatformSelector.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── DeploymentTarget.tsx
│   │   ├── CostEstimator.tsx
│   │   └── CreditBalance.tsx
│   └── layout/              # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Sidebar.tsx
│       └── ErrorBoundary.tsx
├── hooks/                # Custom React hooks
│   ├── useWizard.ts         # Wizard state management
│   ├── useWebSocket.ts      # WebSocket connection
│   ├── useCredits.ts        # Credit management
│   ├── useValidation.ts     # Form validation
│   ├── useGeneration.ts     # Generation process
│   ├── useAuth.ts           # Authentication
│   ├── useLocalStorage.ts   # Local storage persistence
│   └── useDebounce.ts       # Debounced values
├── services/             # API and external services
│   ├── api.ts               # API client configuration
│   ├── websocket.ts         # WebSocket service
│   ├── auth.service.ts      # Authentication service
│   ├── credits.service.ts   # Credits management
│   ├── generation.service.ts # Generation orchestration
│   ├── validation.service.ts # Server-side validation
│   └── storage.service.ts   # File storage operations
├── stores/               # State management
│   ├── wizardStore.ts       # Main wizard state (Zustand)
│   ├── userStore.ts         # User authentication state
│   ├── creditsStore.ts      # Credits and billing state
│   ├── generationStore.ts   # Generation process state
│   └── settingsStore.ts     # User preferences
├── types/                # TypeScript type definitions
│   ├── schemas.ts           # Zod validation schemas
│   ├── wizard.ts            # Wizard-specific types
│   ├── generation.ts        # Generation process types
│   ├── api.ts              # API response types
│   └── index.ts            # Exported types
├── utils/                # Utility functions
│   ├── validation.ts        # Validation helpers
│   ├── formatting.ts        # Data formatting
│   ├── constants.ts         # Application constants
│   ├── errors.ts           # Error handling utilities
│   ├── security.ts         # Security utilities
│   └── analytics.ts        # Analytics tracking
├── styles/               # Styling and themes
│   ├── globals.css          # Global styles
│   ├── components.css       # Component-specific styles
│   ├── theme.ts            # FlashFusion theme tokens
│   └── animations.ts       # Framer Motion presets
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── vite-env.d.ts         # Vite type definitions
```

## Component Boundaries & Responsibilities

### 1. Layout Components (`/components/layout/`)

#### WizardLayout

**Responsibility**: Main wizard container with step navigation, error handling, and progress tracking
**Props**:

```typescript
interface WizardLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  steps: WizardStep[];
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  isLoading?: boolean;
  error?: WizardError | null;
}
```

**State Boundaries**: Does not manage wizard data, only navigation state

#### Header/Footer

**Responsibility**: Consistent branding, user info, navigation
**State Boundaries**: Read-only access to user state, no mutations

### 2. Step Components (`/components/`)

#### StepPlatform

**Responsibility**: Platform and framework selection
**Props**:

```typescript
interface StepPlatformProps {
  value: PlatformForm;
  onChange: (data: PlatformForm) => void;
  errors: FieldErrors<PlatformForm>;
  onValidate: () => Promise<boolean>;
}
```

**State Boundaries**: Controlled component, no internal state

#### StepConfigure

**Responsibility**: App configuration based on selected platform
**Props**:

```typescript
interface StepConfigureProps {
  value: ConfigurationForm;
  onChange: (data: ConfigurationForm) => void;
  platform: Platform;
  framework: Framework;
  errors: FieldErrors<ConfigurationForm>;
}
```

**Conditional Rendering**: Shows/hides fields based on platform selection

#### StepFeatures

**Responsibility**: Feature selection with cost estimation
**Props**:

```typescript
interface StepFeaturesProps {
  value: FeaturesForm;
  onChange: (data: FeaturesForm) => void;
  costEstimate: CostEstimate | null;
  userCredits: number;
  onEstimateCost: () => Promise<void>;
}
```

**Side Effects**: Triggers cost estimation on feature changes

#### StepDeploy

**Responsibility**: Deployment configuration and validation
**Props**:

```typescript
interface StepDeployProps {
  value: DeploymentForm;
  onChange: (data: DeploymentForm) => void;
  onValidateCredentials: (credentials: any) => Promise<boolean>;
}
```

**Async Validation**: API key validation, deployment target verification

#### StepGenerate

**Responsibility**: Generation progress, real-time updates, results
**Props**:

```typescript
interface StepGenerateProps {
  generationState: GenerationState;
  onStart: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onDownload: () => void;
}
```

**WebSocket Integration**: Real-time progress updates

### 3. Form Components (`/components/forms/`)

#### PlatformSelector

**Responsibility**: Visual platform selection with cards
**Props**:

```typescript
interface PlatformSelectorProps {
  platforms: PlatformOption[];
  selected: { platform: Platform; framework: Framework } | null;
  onSelect: (platform: Platform, framework: Framework) => void;
  disabled?: boolean;
}
```

#### FeatureCard

**Responsibility**: Individual feature selection with details
**Props**:

```typescript
interface FeatureCardProps {
  feature: FeatureDefinition;
  selected: boolean;
  onToggle: (featureId: string) => void;
  cost: number;
  disabled?: boolean;
}
```

#### CostEstimator

**Responsibility**: Cost breakdown and credit sufficiency check
**Props**:

```typescript
interface CostEstimatorProps {
  estimate: CostEstimate;
  userCredits: number;
  onPurchaseCredits: () => void;
}
```

### 4. UI Components (`/components/ui/`)

#### Design System Components

All UI components follow FlashFusion brand guidelines:

```typescript
// Brand-consistent Button component
interface ButtonProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "sm" | "md" | "lg";
  color: "orange" | "emerald" | "blue" | "gray";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Form Input with validation
interface InputProps {
  label: string;
  error?: string;
  warning?: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "url";
}
```

## State Management Boundaries

### Zustand Store Structure

```typescript
// wizardStore.ts - Main wizard state
interface WizardState {
  // Form data
  platformData: PlatformForm;
  configData: ConfigurationForm;
  featuresData: FeaturesForm;
  deployData: DeploymentForm;

  // Navigation state
  currentStep: number;
  completedSteps: Set<number>;

  // Validation state
  stepErrors: Record<number, FieldErrors>;
  stepWarnings: Record<number, string[]>;

  // Actions
  updatePlatformData: (data: PlatformForm) => void;
  updateConfigData: (data: ConfigurationForm) => void;
  updateFeaturesData: (data: FeaturesForm) => void;
  updateDeployData: (data: DeploymentForm) => void;
  setCurrentStep: (step: number) => void;
  validateStep: (step: number) => Promise<boolean>;
  reset: () => void;
}
```

### Store Separation Principles

- **Single Responsibility**: Each store manages one domain
- **No Cross-Dependencies**: Stores don't directly reference each other
- **Event-Driven Communication**: Use custom events for store interactions
- **Persistence Strategy**: Critical data persisted to localStorage

## Props Flow & Data Boundaries

### Controlled Components Pattern

```typescript
// Parent component manages all state
const WizardContainer = () => {
  const { platformData, updatePlatformData, errors } = useWizardStore();

  return (
    <StepPlatform
      value={platformData}
      onChange={updatePlatformData}
      errors={errors.platform}
      onValidate={() => validatePlatformStep(platformData)}
    />
  );
};

// Child component is purely presentational
const StepPlatform = ({ value, onChange, errors, onValidate }) => {
  // No internal state, all controlled via props
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onValidate();
      }}
    >
      {/* Form fields */}
    </form>
  );
};
```

### Error Boundary Strategy

```typescript
// Component-level error boundaries
const StepErrorBoundary = ({ children, step }) => (
  <ErrorBoundary
    FallbackComponent={StepErrorFallback}
    onError={(error) => trackError(`wizard_step_${step}`, error)}
    onReset={() => resetWizardStep(step)}
  >
    {children}
  </ErrorBoundary>
);

// Application-level error boundary
const AppErrorBoundary = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={AppErrorFallback}
    onError={(error) => {
      trackError("app_crash", error);
      // Save wizard state before crash
      saveWizardStateToStorage();
    }}
  >
    {children}
  </ErrorBoundary>
);
```

## Component Testing Boundaries

### Unit Testing Strategy

```typescript
// Component props interface testing
describe("StepPlatform", () => {
  it("should call onChange when platform selected", () => {
    const mockOnChange = jest.fn();
    render(<StepPlatform value={mockData} onChange={mockOnChange} />);
    // Test interactions
  });

  it("should display validation errors", () => {
    const errors = { platform: { message: "Required" } };
    render(<StepPlatform errors={errors} />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
```

### Integration Testing Boundaries

```typescript
// Store integration testing
describe("Wizard Flow Integration", () => {
  it("should persist state across steps", async () => {
    const { user } = renderWizard();

    // Step 1: Select platform
    await user.click(screen.getByText("React"));
    await user.click(screen.getByText("Next"));

    // Step 2: Configure
    await user.type(screen.getByLabelText("App Name"), "Test App");
    await user.click(screen.getByText("Previous"));

    // Verify persistence
    expect(screen.getByDisplayValue("React")).toBeChecked();
  });
});
```

## Performance Boundaries

### Code Splitting Strategy

```typescript
// Lazy load step components
const StepPlatform = lazy(() => import("./components/StepPlatform"));
const StepConfigure = lazy(() => import("./components/StepConfigure"));
const StepFeatures = lazy(() => import("./components/StepFeatures"));
const StepDeploy = lazy(() => import("./components/StepDeploy"));
const StepGenerate = lazy(() => import("./components/StepGenerate"));

// Route-based code splitting
const WizardRoute = lazy(() => import("./pages/WizardPage"));
const DashboardRoute = lazy(() => import("./pages/DashboardPage"));
```

### Memoization Boundaries

```typescript
// Expensive calculations memoized
const CostEstimator = memo(({ features, platform }) => {
  const cost = useMemo(
    () => calculateEstimatedCost(features, platform),
    [features, platform]
  );

  return <div>{cost}</div>;
});

// Callback memoization for child components
const StepContainer = () => {
  const handleChange = useCallback(
    (data) => {
      updateWizardData(data);
    },
    [updateWizardData]
  );

  return <StepComponent onChange={handleChange} />;
};
```

## Security Boundaries

### Input Sanitization

```typescript
// All form inputs sanitized at component boundary
const SecureInput = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    onChange(sanitizedValue);
  };

  return <input value={value} onChange={handleChange} {...props} />;
};
```

### XSS Prevention

```typescript
// Dangerous HTML rendering controlled
const SafeMarkdown = ({ content }) => {
  const sanitizedHTML = useMemo(
    () => DOMPurify.sanitize(marked(content)),
    [content]
  );

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};
```

This component structure ensures clear separation of concerns, testability, and maintainability while following React best practices and FlashFusion brand guidelines.
