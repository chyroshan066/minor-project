interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = ({ type = "text", placeholder, ...props }: InputProps) => (
  <input
    type={type}
    className="text-sm focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-surface bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-primary-ring focus:bg-surface focus:text-gray-700 focus:outline-none focus:transition-shadow focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2"
    placeholder={placeholder}
    {...props}
  />
);
