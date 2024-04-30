import { useState } from "react";
import { inspectionApiAxios } from "../api/inspectionApi";

const useAxios = () => {
  const [progress, setProgress] = useState(0);

  const fetchData = async (url) => {
    setProgress(0);
    let pro = 0;

    try {
      const response = await inspectionApiAxios.get(url, {
        onDownloadProgress: (e) => {
          const newProgress = Math.floor(e.progress * 100);
          if (newProgress > pro) {
            setProgress(newProgress);
            pro = newProgress;
          }
        },
      });

      if (response.status !== 200) {
        return {
          data: null,
          error: response.data?.message,
        };
      }

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error?.message,
      };
    }
  };

  const postData = async (url, data) => {
    setProgress(0);
    let pro = 0;

    try {
      const response = await inspectionApiAxios.post(url, data, {
        onUploadProgress: (e) => {
          const newProgress = Math.floor(e.progress * 100);
          if (newProgress > pro) {
            setProgress(newProgress);
            pro = newProgress;
          }
        },
      });

      if (response.status < 200 || response.status > 299) {
        return {
          data: null,
          error: response.data?.message,
        };
      }

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error?.message,
      };
    }
  };

  return { progress, fetchData, postData };
};

export default useAxios;
