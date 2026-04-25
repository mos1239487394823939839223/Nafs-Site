# View Patient Medical History Feature

## Overview
Added a "View" button to the Session History page that allows doctors to view a patient's complete medical history from the `/medical/patients/{patientId}/history` API endpoint.

## Feature Description

### User Workflow
1. Doctor opens **Session History** page (Doctor Dashboard → Session History)
2. For each session, there are now **two action buttons**:
   - **View button (👁️)** - Opens patient medical history modal
   - **Edit button (📝)** - Opens note editor (existing functionality)
3. Click **View button** to open the medical history modal
4. Modal displays:
   - Patient name and session date
   - List of medical records with:
     - Diagnosis name
     - Notes
     - Medications
     - Creation date
5. Click **Close** button to dismiss modal

## Technical Implementation

### 1. HistoryList Component (`src/components/doctor/history/HistoryList.jsx`)

**Changes:**
- Added `Visibility as ViewIcon` import from Material-UI
- Added new prop: `onViewNoteClick` callback function
- Updated actions column to display two buttons:
  - View button (icon only, with title tooltip)
  - Edit button (icon only)

```javascript
<div className="flex gap-2">
  <Button
    variant="ghost"
    size="sm"
    className="text-primary hover:bg-primary/5"
    onClick={() => onViewNoteClick?.(session)}
    title={t("common.view", "View")}
  >
    <ViewIcon className="w-4 h-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="text-primary hover:bg-primary/5"
    onClick={() => onNoteClick?.(session)}
    title={t("common.edit", "Edit")}
  >
    <FileText className="w-4 h-4" />
  </Button>
</div>
```

### 2. SessionHistory Component (`src/views/doctor/SessionHistory.jsx`)

**New State Variables:**
```javascript
const [isViewNoteModalOpen, setIsViewNoteModalOpen] = useState(false);
const [patientHistory, setPatientHistory] = useState(null);
const [isLoadingHistory, setIsLoadingHistory] = useState(false);
```

**New Handler:**
```javascript
const handleViewPatientHistory = async (session) => {
  // Opens modal, sets loading state
  // Fetches patient history using medicalAPI.getPatientHistory()
  // Handles errors with toast notifications
}
```

**New Modal:**
- Displays patient info (name, date)
- Shows loading spinner while fetching
- Lists medical records with diagnosis, notes, medications
- Shows empty state if no history found
- Close button to dismiss

**Updates:**
- Imported `medicalAPI` from `src/lib/api`
- Pass `onViewNoteClick={handleViewPatientHistory}` to HistoryList component

### 3. API Integration

**Using existing method:**
```javascript
medicalAPI.getPatientHistory(patientId, pageIndex, pageSize)
```

**Endpoint:** `GET /medical/patients/{patientId}/history`

**Query Parameters:**
- `patientId`: Patient ID (extracted from session data)
- `pageIndex`: Page number (default 1)
- `pageSize`: Number of records per page (default 100)

**Response Structure:**
```json
{
  "IsSuccess": true,
  "Data": {
    "PageSize": 20,
    "PageIndex": 1,
    "Records": 3,
    "Pages": 1,
    "Items": [
      {
        "Type": 2,
        "Date": "2026-05-11T00:00:00",
        "DoctorID": "1484854688028295168",
        "DoctorName": "hazem doctor.",
        "RecordID": null,
        "TestTypeName": null,
        "TestTypeDescription": null,
        "ScanUrl": null,
        "ExamNotes": null,
        "Result": null,
        "BookingID": "1490434844864282624",
        "DoctorNote": "الحاله سيئه"
      },
      {
        "Type": 1,
        "Date": "2026-04-17T20:00:00",
        "DoctorID": "1489734876390227968",
        "DoctorName": "doctor One",
        "RecordID": "1494759664728932352",
        "TestTypeName": "Hazem Essam",
        "TestTypeDescription": "sss",
        "ScanUrl": "https://emstore-sa.com/",
        "ExamNotes": null,
        "Result": "يييي",
        "BookingID": null,
        "DoctorNote": null
      }
    ]
  }
}
```

**Fields Displayed in Modal:**
- **Type** - Record type (1=Medical Test, 2=Doctor Note)
- **Date** - When the record was created (formatted to locale date)
- **Doctor Name** - Name of the doctor
- **Doctor ID** - Doctor's system ID
- **Test Type Name** - Name of the medical test (if Type=1)
- **Test Type Description** - Description of the test (if Type=1)
- **Doctor Note** - Clinical notes from doctor (if Type=2) - highlighted in yellow
- **Exam Notes** - Observations from exam
- **Result** - Test result (if available) - highlighted in green
- **Scan URL** - Clickable link to scan/file
- **Record ID** - Unique identifier for medical record
- **Booking ID** - Associated booking ID

## User Interface

### Actions Column (Before)
```
┌────────────────────────────────────────────┐
│ Actions                                    │
├────────────────────────────────────────────┤
│ [📝 Notes]                                 │
└────────────────────────────────────────────┘
```

### Actions Column (After)
```
┌────────────────────────────────────────────┐
│ Actions                                    │
├────────────────────────────────────────────┤
│ [👁️] [📝]                                 │
└────────────────────────────────────────────┘
```

### Medical History Modal

**Example with Doctor Note (Type 2):**
```
┌─────────────────────────────────────────────┐
│ Medical History                          ✕ │
├─────────────────────────────────────────────┤
│ Patient: Hazem Patient                      │
│ Date: May 11, 2026                          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [Doctor Note]        05/11/2026         │ │
│ │ Doctor: hazem doctor.                   │ │
│ │                                         │ │
│ │ ┌─────────────────────────────────────┐ │ │
│ │ │ Doctor Note:                        │ │ │
│ │ │ الحاله سيئه                          │ │ │
│ │ └─────────────────────────────────────┘ │ │
│ │                                         │ │
│ │ Record ID: -     Booking ID: 149043... │ │
│ └─────────────────────────────────────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [Medical Test]       04/17/2026         │ │
│ │ Doctor: doctor One                      │ │
│ │ Test Type: Hazem Essam                  │ │
│ │ Description: sss                        │ │
│ │                                         │ │
│ │ ┌─────────────────────────────────────┐ │ │
│ │ │ Result:                             │ │ │
│ │ │ يييي                                 │ │ │
│ │ └─────────────────────────────────────┘ │ │
│ │                                         │ │
│ │ Scan URL: https://emstore-sa.com/      │ │
│ │ Record ID: 1494759664728...             │ │
│ │ Booking ID: -                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Close]                                     │
└─────────────────────────────────────────────┘
```

## Features

### ✅ Implemented
- View button in actions column
- Load patient medical history from API
- Display complete API response with all fields:
  - **Type badge** - Visual distinction (Blue=Medical Test, Green=Doctor Note)
  - **Doctor information** - Name and ID
  - **Date** - Formatted to readable locale date
  - **Test information** (Type 1):
    - Test Type Name
    - Test Type Description
    - Scan URL (clickable link, truncated if long)
    - Exam Notes
  - **Doctor Notes** (Type 2):
    - DoctorNote field with yellow highlight
  - **Result** - Highlighted in green box
  - **Record ID & Booking ID** - In footer section
- Loading state while fetching
- Error handling with toast notifications
- Empty state when no history found
- Modal size: Large (lg) for better readability
- Scrollable content area (max-height: 600px)
- RTL support (Arabic direction)
- Internationalization ready (all labels translated)
- Smart field display (only shows non-null fields)
- Visual highlighting for important data (Notes, Results)
- URL truncation for better display

### 🔄 Workflow
1. Click View button → Opens modal + starts loading
2. API call to `/medical/patients/{patientId}/history`
3. Display records or empty state
4. Can close modal anytime
5. Modal resets on close

## Error Handling

**Cases Handled:**
- Invalid patient ID → Error toast
- Network error → Error toast
- API error response → Shows API error message
- Empty history → Shows empty state message

**User Feedback:**
- Loading spinner while fetching
- Error toast notifications
- Success display of records
- Empty state message

## Browser/RTL Support

- ✅ Full RTL support for Arabic
- ✅ Responsive design (works on mobile/tablet/desktop)
- ✅ Keyboard accessible buttons
- ✅ Touch-friendly on mobile

## Testing Checklist

- [ ] Open Doctor Dashboard → Session History
- [ ] Verify View button appears next to Edit button
- [ ] Click View button for a session
- [ ] Verify loading spinner shows while fetching
- [ ] Verify medical history displays:
  - [ ] Patient name and session date
  - [ ] List of medical records
  - [ ] Diagnosis name for each record
  - [ ] Notes content
  - [ ] Medications
  - [ ] Creation date
- [ ] Click Close button to dismiss modal
- [ ] Test with patient that has no history (empty state)
- [ ] Test with patient that has multiple records
- [ ] Test error handling by mocking API failure
- [ ] Test in RTL mode (Arabic)
- [ ] Test on mobile device
- [ ] Verify tooltip shows on hover for View button
- [ ] Verify smooth loading transitions

## Files Modified
1. `src/components/doctor/history/HistoryList.jsx` - Added View button
2. `src/views/doctor/SessionHistory.jsx` - Added history modal and handler

## Future Enhancements
- Add pagination for long history lists
- Add filtering/search in medical history
- Add print functionality for medical records
- Add export to PDF
- Show medication timeline
- Add notes/comments section
- Integration with medical tests/results
- Add history export option
