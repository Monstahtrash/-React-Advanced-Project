import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Image, Text, Heading, VStack, Button, Input, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from '@chakra-ui/react';

export const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate for redirection
  const [event, setEvent] = useState(null); // Default to null for better conditional rendering
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Toggle between view and edit mode
  const [editedEvent, setEditedEvent] = useState({}); // Holds edited event data
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // State to manage delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState(""); // Store user input for confirmation
  const cancelRef = React.useRef();
  const toast = useToast(); // Initialize Chakra UI Toast

  useEffect(() => {
    FetchEvents();
    FetchCategories();
    FetchUsers();
  }, []);

  useEffect(() => {
    console.log(event);
    console.log(categories);
    console.log(users);
  }, [event, categories, users]);

  async function FetchEvents() {
    const result = await fetch('http://localhost:3000/events');
    const resultData = await result.json();
    const foundEvent = resultData.find((event) => event.id === eventId);
    setEvent(foundEvent);
    setEditedEvent(foundEvent); // Initialize the editedEvent with the event data
  }

  async function FetchCategories() {
    const result = await fetch('http://localhost:3000/categories');
    const resultData = await result.json();
    setCategories(resultData);
  }

  async function FetchUsers() {
    const result = await fetch('http://localhost:3000/users');
    const resultData = await result.json();
    setUsers(resultData);
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submitting the edited form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update the event on the server
      const result = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedEvent),
      });

      if (result.ok) {
        const updatedEvent = await result.json();
        setEvent(updatedEvent); // Update the local event with the updated data
        setIsEditing(false); // Switch back to view mode
        onClose(); // Close the modal

        // Show success toast
        toast({
          title: 'Event updated successfully!',
          description: 'The event details have been updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Handle error if the response is not OK
        throw new Error('Failed to update event');
      }
    } catch (error) {
      // Show error toast
      toast({
        title: 'Error updating event',
        description: error.message || 'There was an issue while updating the event.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle event deletion
  const handleDelete = async () => {
    // Ensure the user types "DELETE" exactly to confirm the deletion
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
      // Show loading toast while waiting for the delete request
      toast({
        title: 'Deleting event...',
        description: 'Please wait while we remove the event.',
        status: 'info',
        duration: null, // Keep the loading message open
        isClosable: false,
      });

      const result = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: 'DELETE',
      });

      console.log(result);
      if (result.ok) {
        // Close the loading toast and show success message
        toast.closeAll();
        toast({
          title: 'Event deleted successfully!',
          description: 'The event has been removed.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to the events page after deletion
        // navigate('/'); // Use navigate to redirect to the events page
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      // Handle network or unexpected errors
      toast.closeAll();
      toast({
        title: 'Error deleting event',
        description: error.message || 'There was an issue while deleting the event.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      // Close the delete confirmation modal in both success and failure cases
      setIsDeleteOpen(false);
    }
  };


  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={4}>
        Event Details
      </Heading>

      <Box bg="gray.100" p={4} borderRadius="md" boxShadow="sm">
        {event && categories && users ? (
          <VStack align="flex-start" spacing={4}>
            {/* Event Title */}
            <Text fontSize="lg" fontWeight="bold">
              {event.title}
            </Text>

            {/* Event Description */}
            <Text fontSize="md" color="gray.600">
              {event.description}
            </Text>

            {/* Event Image */}
            <Image
              src={event.image}
              alt={event.title}
              borderRadius="md"
              boxShadow="sm"
              width="100%"
            />

            {/* Event Start and End Time */}
            <Text>
              <strong>Start Time:</strong> {event.startTime}
            </Text>
            <Text>
              <strong>End Time:</strong> {event.endTime}
            </Text>

            {/* Categories */}
            <Text>
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
            </Text>

            {/* Creator Information */}
            <Text>
              <strong>Created By:</strong>{' '}
              {event.createdBy ? (
                // Find the user with the matching ID
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
            </Text>

            {/* Edit Button */}
            <Button colorScheme="blue" onClick={() => { setIsEditing(true); onOpen(); }}>
              Edit
            </Button>

            {/* Delete Button */}
            <Button colorScheme="red" onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
          </VStack>
        ) : (
          <Text color="red.500">Event, categories, or users data is missing.</Text>
        )}
      </Box>

      {/* Modal for editing event */}
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
                type="text"
                name="startTime"
                value={editedEvent.startTime}
                onChange={handleChange}
                placeholder="Start Time"
                mb={3}
              />
              <Input
                type="text"
                name="endTime"
                value={editedEvent.endTime}
                onChange={handleChange}
                placeholder="End Time"
                mb={3}
              />
              {/* You can add more fields for categories or images here if needed */}
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

      {/* Delete Confirmation Modal */}
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

