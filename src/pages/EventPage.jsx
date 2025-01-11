import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Select, Icon, Image, Text, Heading, VStack, Button, Input, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from '@chakra-ui/react';
import { FaArrowLeft, FaUpload } from "react-icons/fa";

export const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate(); 
  const [event, setEvent] = useState(null); 
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false); 
  const [editedEvent, setEditedEvent] = useState({}); 
  const [editedUser, setEditedUser] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); 
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const cancelRef = React.useRef();
  const toast = useToast(); 

  useEffect(() => {  
    FetchEvents();
  }, []);

  useEffect(() => {
  }, [event, categories, users, editedUser]);

  async function FetchEvents() {
    try {
      const currentUsers = await FetchUsers();
      FetchCategories();
      const result = await fetch('http://localhost:3000/events');
      if (!result.ok) {
        throw new Error(`Error: ${result.status} ${result.statusText}`);
      }
  
      const resultData = await result.json();
      const foundEvent = resultData.find((event) => event.id === eventId);
      setEditedUser(currentUsers.find((user) => user.id == foundEvent.createdBy));
      setEvent(foundEvent);
      setEditedEvent(foundEvent); 
    } catch (error) {
      console.error("Failed to fetch:", error.message);
    }
  }

  async function FetchCategories() {
    try {
      const result = await fetch('http://localhost:3000/categories');
      if (!result.ok) {
        throw new Error(`Error: ${result.status} ${result.statusText}`);
      }
      const resultData = await result.json();
      setCategories(resultData);
    } catch (error) {
      console.error("Failed to fetch:", error.message);
    }
  }

  async function FetchUsers() {
    try {
      const result = await fetch('http://localhost:3000/users');
      const resultData = await result.json();
      setUsers(resultData);
      return resultData;
    } catch (error) {
      console.error("Failed to fetch:", error.message);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(editedEvent);
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(editedUser);
  };

  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const selectedCategories = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }
    setEditedEvent((prevEvent) => ({
      ...prevEvent,
      categoryIds: selectedCategories
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setEditedEvent((prevEvent) => ({
        ...prevEvent,
        ['image']: imageURL
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(editedEvent.title == '' || editedEvent.description == '' || editedEvent.startTime == '' || editedEvent.endTime == '' || editedEvent.createdBy == '' || editedEvent.location == ''){
      alert('Zorg dat alle velden ingevuld zijn!');
    }
    else{
      try {
        await handleUser(editedUser);
        const result = await fetch(`http://localhost:3000/events/${eventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedEvent),
        });

        if (result.ok) {
          const updatedEvent = await result.json();
          setEvent(updatedEvent); 
          setIsEditing(false); 
          onClose(); 

          toast({
            title: 'Event updated successfully!',
            description: 'The event details have been updated.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          window.location.reload();
        } else {
          throw new Error('Failed to update event');
        }
      } catch (error) {
        toast({
          title: 'Error updating event',
          description: error.message || 'There was an issue while updating the event.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  async function handleUser(user){
    const response = await fetch(`http://localhost:3000/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name: user.name}),
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
    }
  }

  // Handle event deletion
  const handleDelete = async () => {
    if (deleteConfirmation.toUpperCase() !== 'DELETE') {
      toast({
        title: 'Action not confirmed',
        description: 'Please type "DELETE" to confirm the deletion.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      toast({
        title: 'Deleting event...',
        description: 'Please wait while we remove the event.',
        status: 'info',
        duration: null,
        isClosable: false,
      });

      const result = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: 'DELETE',
      });

      if (result.ok) {
        toast.closeAll();
        toast({
          title: 'Event deleted successfully!',
          description: 'The event has been removed.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        handleBack(); 
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      toast.closeAll();
      toast({
        title: 'Error deleting event',
        description: error.message || 'There was an issue while deleting the event.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteOpen(false);
    }
  };

  function handleBack(){
    window.location.href = '/';
  }


  return (
    <Box p={6}>
      <Button
        leftIcon={<Icon as={FaArrowLeft} />}
        colorScheme="teal"
        variant="solid"
        onClick={handleBack}
        size="sm"
        boxShadow="sm"
        _hover={{ boxShadow: "md", transform: "scale(1.05)" }}
        _active={{ boxShadow: "lg", transform: "scale(0.95)" }}
        marginBottom="10px"
      >
        Back
      </Button>
      <Heading as="h1" size="xl" mb={4}>
        Event Details
      </Heading>
      <Box bg="gray.100" p={4} borderRadius="md" boxShadow="sm">
        {event && categories && users ? (
          <VStack align="flex-start" spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              {event.title}
            </Text>
            <Text fontSize="md" color="gray.600">
              {event.description}
            </Text>
            <Image
              src={event.image}
              alt={event.title}
              borderRadius="md"
              boxShadow="sm"
              width="33%"
            />
            <Text>
              <strong>Start Time:</strong> {event.startTime}
            </Text>
            <Text>
              <strong>End Time:</strong> {event.endTime}
            </Text>
            <Box>
              <strong>Categories:</strong>{' '}
              {event.categoryIds.map((categoryId, index) => {
                const category = categories.find((category) => category.id == categoryId);
                return category ? (
                  <Text as="span" key={index}>
                    {category.name}
                    {index < event.categoryIds.length - 1 ? ', ' : ''}
                  </Text>
                ) : (
                  <Text as="span" key={index} color="red.500">
                    Category not found
                  </Text>
                );
              })}
            </Box>
            <Box>
              <strong>Created By:</strong>{' '}
              {event.createdBy ? (
                users.length > 0 ? (
                  users.map((user) => {
                    if (user.id == event.createdBy) {
                      return (
                        <Text as="span" key={user.id}>
                          {user.name}
                        </Text>
                      );
                    }
                    return null;
                  })
                ) : (
                  <Text color="red.500">User not found</Text>
                )
              ) : (
                <Text color="red.500">Creator not specified</Text>
              )}
            </Box>

            <Button colorScheme="blue" onClick={() => { setIsEditing(true); onOpen(); }}>
              Edit
            </Button>

            <Button colorScheme="red" onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
          </VStack>
        ) : (
          <Text color="red.500">Event, categories, or users data is missing.</Text>
        )}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="title"
                value={editedEvent.title}
                onChange={handleChange}
                placeholder="Event Title"
                mb={3}
              />
              <Textarea
                name="description"
                value={editedEvent.description}
                onChange={handleChange}
                placeholder="Event Description"
                mb={3}
              />
              <Input
                type="datetime-local"
                name="startTime"
                value={editedEvent.startTime}
                onChange={handleChange}
                placeholder="Start Time"
                mb={3}
              />
              <Input
                 type="datetime-local"
                name="endTime"
                value={editedEvent.endTime}
                onChange={handleChange}
                placeholder="End Time"
                mb={3}
              />
              <Select
                multiple
                value={editedEvent.categoryIds}
                onChange={handleCategoryChange}
                height="45px"
                mb={3}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Input
                name="name"
                value={editedUser.name}
                onChange={handleUserChange}
                placeholder="Created by"
                mb={3}
              />
              <Input
                name="location"
                value={editedEvent.location}
                onChange={handleChange}
                placeholder="Location"
                mb={3}
              />
              <Button
                as="label"
                htmlFor="image-upload"
                leftIcon={<Icon as={FaUpload} />}
                colorScheme="teal"
                variant="solid"
                cursor="pointer"
                mb={3}
              >
                Upload Image
              </Button>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
              <ModalFooter>
                <Button type="submit" colorScheme="blue">
                  Save Changes
                </Button>
                <Button onClick={onClose} ml={3}>
                  Cancel
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={() => setIsDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>Are you absolutely sure you want to delete this event? This action cannot be undone.</Text>
              <Text mt={2}>Please type <strong>DELETE</strong> below to confirm:</Text>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE"
                mt={2}
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isDisabled={deleteConfirmation.toUpperCase() !== 'DELETE'}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

