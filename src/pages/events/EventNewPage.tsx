import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { eventStorage, firestore } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { EventFormType } from "../../utils/formType";
import { NewEvent } from "../../utils/newEvent";
import { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer, ToastOptions } from "react-toastify";

const NewEventPage = () => {
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<EventFormType>({
    name: "",
    type: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(), // Provide the required arguments for the Timestamp constructor
    suiEventId: "",
    status: "",
  });
  const [image, setImage] = useState<File>();

  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const handleInputChange = (event: any) => {
    setFormState({
      ...formState,
      [event.target.id]: event.target.value,
    });
  };

  const handleRadioChange = (event: any) => {
    setFormState({
      ...formState,
      type: event.target.id,
    });
  };
  const handleImageChange = (event: any) => {
    let image = event.target.files[0];
    let imagePreviewUrl = URL.createObjectURL(image);

    setImage(image);

    setImagePreviewUrl(imagePreviewUrl);
  };

  const uploadImage = async () => {
    let result = {
      status: false,
      imageUrl: "",
    };
    if (image != null) {
      const imageName = image.name;
      const ImageRef = ref(eventStorage, `events/${imageName}`);
      await uploadBytes(ImageRef, image)
        .then(async () => {
          const imageUrl = await getDownloadURL(ImageRef);
          result.status = true;
          result.imageUrl = imageUrl;
        })
        .catch((e) => {
          console.log(e);
        });
    }
    return result;
  };

  function validateEvent(event: any): boolean {
    return requiredAttributes.every(
      (attr) =>
        event[attr] !== undefined && event[attr] !== null && event[attr] !== "",
    );
  }
  const requiredAttributes = [
    "name",
    "type",
    "description",
    "startDate",
    "endDate",
    "suiEventId",
    "status",
  ];

  const createEvent = async (e: any): Promise<void> => {
    setDisabled(true);
    e.preventDefault();
    const eventCollection = collection(firestore, "events");
    const suiEvent = await NewEvent().catch((e) => {
      alert("Error creating event");
      console.log(e);
    });
    const imageUpload = await uploadImage().catch(() => {
      alert("Error uploading image");
    });
    if (imageUpload?.status == true && suiEvent?.success == true) {
      const startDateTime = new Date(formState.startDate);
      const now = new Date();
      const status =
        startDateTime > now
          ? (formState.status = "pending")
          : (formState.status = "active");

      const event = {
        ...formState,
        imageUrl: imageUpload.imageUrl,
        suiEventId: suiEvent?.suiEventId,
        status: status,
        createdAt: Timestamp.now(),
      };

      if (!validateEvent(event)) {
        toast.error("Poll create failed!", toastOptions);
      } else {
        await addDoc(eventCollection, event)
          .then((result) => {
            toast.success("Poll created successfully!", toastOptions);
            navigate(`/polls/${result?.id}`, { replace: true });
          })
          .catch(() => {
            toast.error("Poll create failed!", toastOptions);
          });
      }
    }
    setDisabled(false);
  };

  return (
    <div>
      <section className="bg-gray-100">
        <ToastContainer />
        <div className="mx-auto py-6 px-1 sm:px-2 lg:px-4">
          <div className="rounded-lg bg-white shadow-lg">
            <div className="text-2xl font-semibold my-4 ml-8 inline-block">
              Create Poll
            </div>
            <hr />
            <form className="grid grid-cols-7 space-x-4 px-8 pt-4 pb-8">
              <div className="col-span-4">
                <div className="p-2 my-2">Event Name</div>
                <label className="sr-only" htmlFor="name">
                  Name
                </label>
                <input
                  required
                  className="w-full border rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Name"
                  type="text"
                  id="name"
                  value={formState.name}
                  onChange={handleInputChange}
                />

                <div className="p-2 my-2">Event Description</div>
                <label className="sr-only" htmlFor="description">
                  Description
                </label>

                <textarea
                  required
                  className="w-full border rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Description"
                  rows={8}
                  id="description"
                  value={formState.description}
                  onChange={handleInputChange}
                ></textarea>

                <div className="p-2 my-2">Event Duration</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="sr-only" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      required
                      className="w-full border rounded-lg border-gray-200 p-3 text-sm"
                      type="datetime-local"
                      id="startDate"
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="sr-only" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      required
                      className="w-full border rounded-lg border-gray-200 p-3 text-sm"
                      type="datetime-local"
                      id="endDate"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="my-2 p-2 flex space-x-4">
                  <p>Poll Banner</p>
                  {imagePreviewUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="text-blue-500"
                    >
                      Change
                    </button>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-center">
                    <div
                      className={`border-2 border-dashed border-gray-40 text-center bg-white rounded-lg max-w-md w-full cursor-pointer ${!imagePreviewUrl && "p-24"}`}
                      style={{ height: "292px" }}
                    >
                      {imagePreviewUrl ? (
                        <img
                          className="w-full rounded-lg"
                          style={{ maxHeight: "400px", height: "100%" }}
                          src={imagePreviewUrl}
                          alt=""
                        />
                      ) : (
                        <div
                          onClick={() => {
                            fileInputRef.current?.click();
                          }}
                        >
                          <p className="text-lg mb-2">
                            <strong>Add & Drop</strong> or{" "}
                            <button type="button" className="text-blue-500">
                              Browse
                            </button>
                          </p>
                          <p className="text-sm text-gray-600">
                            We currently support JPG, JPEG, PNG and make sure
                            your file size is not more than 500kb
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImageChange}
                        accept=".jpg, .jpeg, .png"
                      />
                    </div>
                  </div>
                </div>
                <div className="my-2 p-2">Poll Type</div>
                <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="private"
                      className="block w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-gray-600 hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
                      tabIndex={0}
                    >
                      <input
                        required
                        className="sr-only"
                        id="private"
                        type="radio"
                        tabIndex={-1}
                        name="type"
                        value={formState.type}
                        onChange={handleRadioChange}
                      />

                      <span className="text-sm"> Private </span>
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="public"
                      className="block w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-gray-600 hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
                      tabIndex={0}
                    >
                      <input
                        required
                        className="sr-only"
                        id="public"
                        type="radio"
                        tabIndex={1}
                        name="type"
                        value={formState.type}
                        onChange={handleRadioChange}
                      />

                      <span className="text-sm"> Public </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-span-4 mt-10"></div>
              <div className="col-span-3 mt-10 flex justify-end space-x-8">
                <Link
                  to="/"
                  className="inline-block w-full rounded-lg bg-red-500 px-5 py-3 font-medium text-white sm:w-auto"
                >
                  Cancel
                </Link>
                <button
                  disabled={disabled}
                  onClick={createEvent}
                  type="submit"
                  className="inline-block w-full rounded-lg bg-green-600 px-5 py-3 font-medium text-white sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewEventPage;
