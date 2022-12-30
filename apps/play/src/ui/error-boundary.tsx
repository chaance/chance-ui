import * as React from "react";

export class ErrorBoundary<ErrorType = unknown> extends React.Component<
	ErrorBoundaryProps<ErrorType>,
	ErrorBoundaryState<ErrorType>,
	ErrorBoundaryState<ErrorType>
> {
	constructor(props: ErrorBoundaryProps<ErrorType>) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: unknown): ErrorBoundaryState<unknown> {
		return { hasError: true, error };
	}

	componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
		// You can also log the error to an error reporting service
		console.warn({ error }, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return typeof this.props.fallback === "function"
				? this.props.fallback({ error: this.state.error })
				: this.props.fallback;
		}
		return this.props.children;
	}
}

interface ErrorBoundaryProps<ErrorType> {
	children: React.ReactNode;
	fallback:
		| React.ReactNode
		| ((props: { error: ErrorType | null }) => React.ReactNode);
}

interface ErrorBoundaryState<ErrorType> {
	hasError: boolean;
	error: ErrorType | null;
}
