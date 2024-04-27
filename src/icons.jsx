import { Icon } from "@chakra-ui/react";

export const ChevronLeft = (props) => {
  return (
    <Icon viewBox="0 0 320 512" fill="currentcolor" {...props}>
      <path d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"></path>
    </Icon>
  );
};

export const BoldIcon = (props) => {
  return (
    <Icon viewBox="0 0 20 20" fill="currentcolor" {...props}>
      <path d="M3 19V1h8a5 5 0 013.88 8.16A5.5 5.5 0 0111.5 19H3zm7.5-8H7v5h3.5a2.5 2.5 0 100-5zM7 4v4h3a2 2 0 100-4H7z"></path>
    </Icon>
  );
};

export const ItalicIcon = (props) => {
  return (
    <Icon viewBox="0 0 20 20" fill="currentcolor" {...props}>
      <path d="M8 1h9v2H8V1zm3 2h3L8 17H5l6-14zM2 17h9v2H2v-2z"></path>
    </Icon>
  );
};

export const UnderlineIcon = (props) => {
  return (
    <Icon viewBox="0 0 20 20" fill="currentcolor" {...props}>
      <path d="M16 9A6 6 0 114 9V1h3v8a3 3 0 006 0V1h3v8zM2 17h16v2H2v-2z"></path>
    </Icon>
  );
};

export const JustifyIcon = (props) => {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M21 10L3 10"></path>
      <path d="M21 6L3 6"></path>
      <path d="M21 14L3 14"></path>
      <path d="M21 18L3 18"></path>
    </Icon>
  );
};

export const LeftAlignIcon = (props) => {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M17 10L3 10"></path>
      <path d="M21 6L3 6"></path>
      <path d="M21 14L3 14"></path>
      <path d="M17 18L3 18"></path>
    </Icon>
  );
};
export const RightAlignIcon = (props) => {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M21 10L7 10"></path>
      <path d="M21 6L3 6"></path>
      <path d="M21 14L3 14"></path>
      <path d="M21 18L7 18"></path>
    </Icon>
  );
};

export const LinkIcon = (props) => {
  return (
    <Icon fill="currentColor" viewBox="0 0 16 16" {...props}>
      <path d="M6.354 5.5H4a3 3 0 000 6h3a3 3 0 002.83-4H9c-.086 0-.17.01-.25.031A2 2 0 017 10.5H4a2 2 0 110-4h1.535c.218-.376.495-.714.82-1z"></path>
      <path d="M9 5.5a3 3 0 00-2.83 4h1.098A2 2 0 019 6.5h3a2 2 0 110 4h-1.535a4.02 4.02 0 01-.82 1H12a3 3 0 100-6H9z"></path>
    </Icon>
  );
};

export const PencilIcon = (props) => {
  return (
    <Icon viewBox="0 0 64 64" fill="currentcolor" {...props}>
      <path d="M55.736 13.636l-4.368-4.362a2.308 2.308 0 00-1.636-.677c-.592 0-1.184.225-1.635.676l-3.494 3.484 7.639 7.626 3.494-3.483a2.305 2.305 0 000-3.264z"></path>
      <path d="M21.922 35.396L29.562 43.023 50.607 22.017 42.967 14.39z"></path>
      <path d="M20.273 37.028L18.642 46.28 27.913 44.654z"></path>
      <path d="M41.393 50.403H12.587V21.597h20.329l5.01-5H10.82a3.243 3.243 0 00-3.234 3.234V52.17a3.243 3.243 0 003.234 3.234h32.339a3.243 3.243 0 003.234-3.234V29.049l-5 4.991v16.363z"></path>
    </Icon>
  );
};

export const CheckIcon = (props) => {
  return (
    <Icon viewBox="0 0 512 512" fill="currentcolor" {...props}>
      <path d="M480 128c0 8.188-3.125 16.38-9.375 22.62l-256 256C208.4 412.9 200.2 416 192 416s-16.38-3.125-22.62-9.375l-128-128C35.13 272.4 32 264.2 32 256c0-18.28 14.95-32 32-32 8.188 0 16.38 3.125 22.62 9.375L192 338.8l233.4-233.4c6.2-6.27 14.4-9.4 22.6-9.4 17.1 0 32 13.7 32 32z"></path>
    </Icon>
  );
};

export const CrossIcon = (props) => {
  return (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.707 5.293a1 1 0 010 1.414L13.414 12l5.293 5.293a1 1 0 01-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 01-1.414-1.414L10.586 12 5.293 6.707a1 1 0 011.414-1.414L12 10.586l5.293-5.293a1 1 0 011.414 0z"></path>
    </Icon>
  );
};

export const CenterAlignIcon = (props) => {
  return (
    <Icon viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path fill="none" d="M0 0H256V256H0z"></path>
      <path d="M40 76h176a8 8 0 000-16H40a8 8 0 000 16zM64 100a8 8 0 000 16h128a8 8 0 000-16zM216 140H40a8 8 0 000 16h176a8 8 0 000-16zM192 180H64a8 8 0 000 16h128a8 8 0 000-16z"></path>
    </Icon>
  );
};

export const StrikethroughIcon = (props) => {
  return (
    <Icon viewBox="0 0 512 512" fill="currentColor" {...props}>
      <path d="M332.2 319.9c17.22 12.17 22.33 26.51 18.61 48.21-3.031 17.59-10.88 29.34-24.72 36.99-35.44 19.75-108.5 11.96-186-19.68-16.34-6.686-35.03 1.156-41.72 17.53s1.188 35.05 17.53 41.71c31.75 12.93 95.69 35.37 157.6 35.37 29.62 0 58.81-5.156 83.72-18.96 30.81-17.09 50.44-45.46 56.72-82.11 3.998-23.27 2.168-42.58-3.488-59.05H332.2zm155.8-80l-176.5-.03c-15.85-5.614-31.83-10.34-46.7-14.62-85.47-24.62-110.9-39.05-103.7-81.33 2.5-14.53 10.16-25.96 22.72-34.03 20.47-13.15 64.06-23.84 155.4.343 17.09 4.53 34.59-5.654 39.13-22.74 4.531-17.09-5.656-34.59-22.75-39.12-91.31-24.18-160.7-21.62-206.3 7.654C121.8 73.72 103.6 101.1 98.09 133.1c-8.83 51.4 9.81 84.2 39.11 106.8H24c-13.25 0-24 10.75-24 23.1 0 13.25 10.75 23.1 24 23.1h464c13.25 0 24-10.75 24-23.1 0-12.3-10.7-23.1-24-23.1z"></path>
    </Icon>
  );
};

export const MoreIcon = (props) => {
  return (
    <Icon viewBox="0 0 32 32" fill="currentcolor" {...props}>
      <path d="M13 16c0 1.654 1.346 3 3 3s3-1.346 3-3-1.346-3-3-3-3 1.346-3 3z"></path>
      <path d="M13 26c0 1.654 1.346 3 3 3s3-1.346 3-3-1.346-3-3-3-3 1.346-3 3z"></path>
      <path d="M13 6c0 1.654 1.346 3 3 3s3-1.346 3-3-1.346-3-3-3-3 1.346-3 3z"></path>
    </Icon>
  );
};

export const UserIcon = (props) => {
  return (
    <Icon viewBox="0 0 32 32" {...props} fill="currentcolor">
      <path d="M23.74 16.18a1 1 0 10-1.41 1.42A9 9 0 0125 24c0 1.22-3.51 3-9 3s-9-1.78-9-3a9 9 0 012.63-6.37 1 1 0 000-1.41 1 1 0 00-1.41 0A10.92 10.92 0 005 24c0 3.25 5.67 5 11 5s11-1.75 11-5a10.94 10.94 0 00-3.26-7.82z"></path>
      <path d="M16 17a7 7 0 10-7-7 7 7 0 007 7zm0-12a5 5 0 11-5 5 5 5 0 015-5z"></path>
    </Icon>
  );
};

export const LocationIcon = (props) => {
  return (
    <Icon viewBox="0 0 64 64" fill="currentcolor" {...props}>
      <path d="M32 55.7l-.9-1.1c-.6-.8-15.9-18.7-15.9-29.4 0-9.3 7.6-16.8 16.8-16.8S48.8 16 48.8 25.2c0 10.7-15.3 28.7-15.9 29.4l-.9 1.1zm0-45c-8 0-14.4 6.5-14.4 14.4 0 8.4 11.1 22.7 14.4 26.8 3.3-4.1 14.4-18.3 14.4-26.8 0-7.9-6.4-14.4-14.4-14.4z"></path>
      <path d="M32 31.6c-3.5 0-6.4-2.9-6.4-6.4s2.9-6.4 6.4-6.4 6.4 2.9 6.4 6.4-2.9 6.4-6.4 6.4zm0-10.4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"></path>
    </Icon>
  );
};

export const DeleteIcon = (props) => {
  return (
    <Icon viewBox="0 0 48 48" fill="currentcolor" {...props}>
      <path d="M41 48H7V7h34v41zM9 46h30V9H9v37z"></path>
      <path d="M35 9H13V1h22v8zM15 7h18V3H15v4zm1 34a1 1 0 01-1-1V15a1 1 0 112 0v25a1 1 0 01-1 1zm8 0a1 1 0 01-1-1V15a1 1 0 112 0v25a1 1 0 01-1 1zm8 0a1 1 0 01-1-1V15a1 1 0 112 0v25a1 1 0 01-1 1z"></path>
      <path d="M0 7h48v2H0z"></path>
    </Icon>
  );
};

export const PlusIcon = (props) => {
  return (
    <Icon viewBox="0 0 32 32" fill="currentcolor" {...props}>
      <path d="M28 14H18V4a2 2 0 00-4 0v10H4a2 2 0 000 4h10v10a2 2 0 004 0V18h10a2 2 0 000-4z"></path>
    </Icon>
  );
};
