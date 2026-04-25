# Session History Notes API Integration

## Overview
Connected the session history notes feature in the Doctor's dashboard to the backend API endpoint `/Doctor/Booking/{id}/Note` (POST method).

## Changes Made

### 1. API Integration (`src/lib/api.js`)
Added new method to `doctorAPI`:

```javascript
// Add or update booking note
addBookingNote: async (bookingId, note) => {
  const response = await api.post(`/Doctor/Booking/${bookingId}/Note`, {
    Note: note,
  });
  return response.data;
}
```

**Endpoint:** `POST /Doctor/Booking/{id}/Note`  
**Request Body:** `{ "Note": "string" }`  
**Response:** Standard API response with `IsSuccess`, `Message`, and `Data` fields

### 2. SessionHistory Component Updates (`src/views/doctor/SessionHistory.jsx`)

#### State Management
Added loading state for note saving:
```javascript
const [isSavingNote, setIsSavingNote] = useState(false);
```

#### Updated `handleSaveNote` Function
Changed from synchronous local state update to async API call:

**Before:**
```javascript
const handleSaveNote = () => {
  // Only updated local state
  setSessionNotes((prev) => ({
    ...prev,
    [selectedSession.id]: noteText.trim(),
  }));
  toast.success(t("success.saved", "Saved successfully"));
}
```

**After:**
```javascript
const handleSaveNote = async () => {
  if (!selectedSession?.id) return;

  try {
    setIsSavingNote(true);
    const response = await doctorAPI.addBookingNote(
      selectedSession.id, 
      noteText.trim()
    );

    if (response.IsSuccess) {
      // Update local state only after API succeeds
      setSessionNotes((prev) => ({
        ...prev,
        [selectedSession.id]: noteText.trim(),
      }));

      setIsNoteModalOpen(false);
      setSelectedSession(null);
      setNoteText("");
      toast.success(t("success.saved", "Saved successfully"));
    } else {
      toast.error(response.Message || t("errors.somethingWentWrong"));
    }
  } catch (error) {
    console.error("Failed to save note:", error);
    toast.error(t("errors.somethingWentWrong"));
  } finally {
    setIsSavingNote(false);
  }
}
```

#### Updated Save Button
Enhanced button with loading state and disabled state:

```javascript
<Button
  onClick={handleSaveNote}
  className="gap-2"
  disabled={!noteText.trim() || isSavingNote}
  loading={isSavingNote}
>
  <FileText className="w-4 h-4" />
  {isSavingNote ? t("common.saving", "Saving...") : t("common.save", "Save")}
</Button>
```

## Functionality

### Workflow
1. Doctor clicks on **Notes** action button in the Session History table
2. Modal opens with note editor
3. Doctor types or updates the note
4. Clicks **Save** button
5. API call is made to `/Doctor/Booking/{id}/Note` with the note text
6. Loading state is shown on button during request
7. On success:
   - Note is saved locally in component state
   - Success toast appears
   - Modal closes
8. On error:
   - Error toast appears with error message
   - Modal stays open for user to retry or cancel

### Error Handling
- Network errors are caught and displayed to user
- API errors (from response.Message) are shown in toast
- Generic error message as fallback
- Form state is preserved on error (user can retry or close)

### User Feedback
- **Loading State:** Button shows "Saving..." text and is disabled
- **Success:** Toast notification appears
- **Error:** Toast notification with error message
- **Button States:**
  - Disabled when note is empty
  - Disabled while saving
  - Enabled when note has content and not saving

## Testing Checklist

- [ ] Open Doctor's Dashboard → Session History
- [ ] Click Notes action button for any session
- [ ] Type a note in the modal
- [ ] Click Save button
- [ ] Observe loading state on button
- [ ] Verify API call in Network tab:
  - URL: `/Doctor/Booking/{bookingId}/Note`
  - Method: POST
  - Body: `{ "Note": "text content" }`
- [ ] Verify success toast appears
- [ ] Modal closes and note is saved
- [ ] Try saving an empty note (button should be disabled)
- [ ] Clear the form and click Cancel to close

## API Integration Details

### Request Format
```
POST /Doctor/Booking/2/Note
Content-Type: application/json

{
  "Note": "Patient showed good progress this session..."
}
```

### Response Format
```json
{
  "IsSuccess": true,
  "Message": "Note saved successfully",
  "Data": null,
  "StatusCode": 200
}
```

### Error Response
```json
{
  "IsSuccess": false,
  "Message": "Booking not found",
  "Data": null,
  "StatusCode": 404
}
```

## Files Modified
1. `src/lib/api.js` - Added `addBookingNote` method to `doctorAPI`
2. `src/views/doctor/SessionHistory.jsx` - Updated note saving logic and UI

## Future Enhancements
- Auto-save notes with debouncing
- Note history/versioning
- Rich text editor for notes
- Note attachments
- Collaborative note editing if multiple doctors can access same patient
