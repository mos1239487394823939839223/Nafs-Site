const fs = require('fs');
const path = require('path');

const ICON_MAP = {
    Search: 'Search',
    MessageSquare: 'ChatBubbleOutline',
    Loader2: 'Sync',
    RefreshCw: 'Refresh',
    Stethoscope: 'MedicalServices',
    User: 'Person',
    Headphones: 'Headphones',
    Eye: 'Visibility',
    EyeOff: 'VisibilityOff',
    Lock: 'Lock',
    Download: 'Download',
    Filter: 'FilterList',
    Calendar: 'CalendarToday',
    ChevronLeft: 'ChevronLeft',
    ChevronRight: 'ChevronRight',
    Save: 'Save',
    Plus: 'Add',
    Trash2: 'Delete',
    Ban: 'Block',
    LayoutGrid: 'GridView',
    Clock: 'AccessTime',
    X: 'Close',
    Users: 'People',
    FileText: 'Description',
    ArrowLeft: 'ArrowBack',
    Pill: 'Medication',
    ArrowRight: 'ArrowForward',
    CheckCircle: 'CheckCircle',
    Mail: 'Mail',
    Home: 'Home',
    Shield: 'Security',
    Camera: 'PhotoCamera',
    Phone: 'Phone',
    MapPin: 'LocationOn',
    Heart: 'Favorite',
    Bell: 'Notifications',
    Smartphone: 'Smartphone',
    Check: 'Check',
    TestTube: 'Science',
    Menu: 'Menu',
    Moon: 'DarkMode',
    Sun: 'LightMode',
    Globe: 'Language',
    Activity: 'ShowChart',
    AlertCircle: 'ErrorOutline',
    Briefcase: 'Work',
    CheckCheck: 'DoneAll',
    Paperclip: 'AttachFile',
    Smile: 'SentimentSatisfied',
    Play: 'PlayArrow',
    XCircle: 'Cancel',
    DollarSign: 'AttachMoney',
    TrendingUp: 'TrendingUp',
    TrendingDown: 'TrendingDown',
    UserPlus: 'PersonAdd',
    Star: 'Star',
    StarHalf: 'StarHalf',
    StarOutline: 'StarOutline',
    Send: 'Send',
    Bot: 'SmartToy',
    Key: 'VpnKey',
    LogOut: 'Logout',
    Settings: 'Settings',
    Edit: 'Edit',
    MoreVertical: 'MoreVert',
    MenuSquare: 'MenuOpen',
    File: 'InsertDriveFile',
    LogOut: 'Logout',
    AlertTriangle: 'WarningAmber'
};

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

let replacedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Find import { ... } from 'lucide-react'
    // Note: it might span multiple lines
    const regex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;

    if (regex.test(content)) {
        content = content.replace(regex, (match, importsStr) => {
            replacedCount++;
            const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);

            const newImports = imports.map(imp => {
                let originalName = imp;
                let localName = imp;

                if (imp.includes(' as ')) {
                    [originalName, localName] = imp.split(' as ').map(i => i.trim());
                }

                const muiIcon = ICON_MAP[originalName] || originalName;

                if (muiIcon === localName) {
                    return muiIcon;
                }
                return `${muiIcon} as ${localName}`;
            });

            return `import { ${newImports.join(', ')} } from '@mui/icons-material'`;
        });

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log(`Done. Updated ${replacedCount} imports.`);
