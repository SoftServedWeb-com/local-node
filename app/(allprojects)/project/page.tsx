'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, Info, Play, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AddDependencydialogbox } from '@/components/addDependencydialogbox';
import { invoke } from '@tauri-apps/api/tauri';
import { useState } from 'react';
import { useProjectAnalyzer } from '@/lib/projectDetails';
import { Input } from '@/components/ui/input';
import { UpdateDependencyDialog } from '@/components/updateDependencyDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const vsCodeLaunch = async (projectId: string) => {
  const allProjectPath = localStorage.getItem('projectsPath');
  console.log(allProjectPath);
  if (allProjectPath) {
    const projectPath = allProjectPath + '/' + projectId;
    await invoke("launch_vscode", { projectPath });
  }
};

const explorerLaunch = async (projectId: string) => {
  const allProjectPath = localStorage.getItem('projectsPath');
  console.log(allProjectPath);
  if (allProjectPath) {
    const projectPath = `${allProjectPath}/${projectId}/`;
    await invoke("open_file_explorer", { projectPath });
  }
};

const localHostLaunch = async (projectId: string) => {
  const allProjectPath = localStorage.getItem('projectsPath');
  if (allProjectPath) {
    const projectPath = `${allProjectPath}/${projectId}`;
    try {
      const runtime = await invoke('detect_runtime', { projectPath });
      let command = '';

      switch (runtime) {
        case 'pnpm':
          command = 'pnpm run dev';
          break;
        case 'bun':
          command = 'bun run dev';
          break;
        case 'npm':
          command = 'npm run dev';
          break;
        default:
          console.error('Unsupported runtime detected');
          return;
      }

      await invoke('run_command', { projectPath, command });
    } catch (error) {
      console.error('Error detecting runtime or running command:', error);
    }
  }
};


export default function Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('page');
  const [activeTab, setActiveTab] = useState('overview');
  const {projectInfo,error} = useProjectAnalyzer();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false); // State for update dialog
  const [selectedDependency, setSelectedDependency] = useState<string | null>(null); // Manage selected dependency
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dependencyToDelete, setDependencyToDelete] = useState<string | null>(null);


  const handleAddDependency = () => {
    setIsDialogOpen(true); // Open the dialog
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false); // Close the dialog
  };

  const handleDependencySubmit = (name: string, version: string) => {
    console.log('Adding dependency:', name, version);
    // Add your logic to handle the new dependency, e.g., updating state or making API calls
  };
  

  const openUpdateDialog = (dependency: string) => {
    setSelectedDependency(dependency);
    setIsUpdateDialogOpen(true); // Open the dialog for updating
  };

  const handleUpdateDependency = (name: string, version: string) => {
    console.log(`Updating dependency: ${name} to version ${version}`);
    // Implement actual update logic here
  };

  const closeUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
  };

  const handleDeleteDependency = (dependency: string) => {
    setDependencyToDelete(dependency);  // Set the dependency to delete
    setIsDeleteDialogOpen(true);  // Open the delete confirmation dialog
  };


  const confirmDeleteDependency = () => {
    if (dependencyToDelete) {
      console.log(`Deleting dependency: ${dependencyToDelete}`);
      // Implement actual delete logic here
      // Example: You might call an API or update the state to remove the dependency
  
      // Close the dialog after deletion
      setIsDeleteDialogOpen(false);
      setDependencyToDelete(null);
    }
  };
  
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDependencyToDelete(null);
  };

  

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-4 p-6">
        <h1 className="text-3xl font-bold">{projectId}</h1>
        <Button
          onClick={() => localHostLaunch(projectId as string)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors ml-auto"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Site
        </Button>
      </header>

      {/* Navigation Section */}
      <nav className="mb-4 p-6">
        <ul className="flex space-x-6">
          <li>
            <Link
              href="#"
              onClick={() => explorerLaunch(projectId as string)}
              className="text-purple-400 hover:underline"
            >
              Go to Site Folder
            </Link>
          </li>
          <li>
            <Link
              href="#"
              onClick={() => vsCodeLaunch(projectId as string)}
              className="text-purple-400 hover:underline"
            >
              VS Code
            </Link>
          </li>
        </ul>
      </nav>

      {/* Tabs Section */}
      <div className="p-6">
        <ul className="m-0 p-0 flex space-x-6 border-b border-gray-700">
          <li className={`pb-2 ${activeTab === 'overview' ? 'border-b-2 border-purple-500' : ''}`}>
            <Link href="#" onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-purple-300">
              Overview
            </Link>
          </li>
          <li className={`pb-2 ${activeTab === 'packages' ? 'border-b-2 border-purple-500' : ''}`}>
            <Link href="#" onClick={() => setActiveTab('packages')} className="text-gray-400 hover:text-purple-300">
              Packages
            </Link>
          </li>
          <li className={`pb-2 ${activeTab === 'terminal' ? 'border-b-2 border-purple-500' : ''}`}>
            <Link href="#" onClick={() => setActiveTab('terminal')} className="text-gray-400 hover:text-purple-300">
              Terminal
            </Link>
          </li>
        </ul>
      </div>

      {/* Content Section */}
      <div className="p-6">
      
        {activeTab === 'overview' && (
          <div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {projectInfo && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-6">
                  <DetailRow label="Framework" value={projectInfo.framework} />
                  <DetailRow label="Runtime" value={projectInfo.runtime} linkText="Change" />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'packages' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={handleAddDependency}
                className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Dependency
              </Button>
              <div className="flex items-center relative">
                <Search className="absolute left-3 w-5 h-5 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search packages"
                  className="bg-gray-800 w-full py-2 pl-10 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>
            </div>
            <div className="h-80 overflow-y-auto">
              {projectInfo && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className="space-y-6">
                    {projectInfo.packages.map((pkg, index) => (
                      <DetailRow
                        key={index}
                        label={pkg.name}
                        value={pkg.version}
                        updateButton={true} // Show the update button
                        onUpdate={() => openUpdateDialog(pkg.name)}  // Pass the update function
                        onDelete={() => handleDeleteDependency(pkg.name)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
         <UpdateDependencyDialog
          isOpen={isUpdateDialogOpen}
          onClose={closeUpdateDialog}
          onSubmit={handleUpdateDependency}
          dependency={selectedDependency || ''} // Pass selected dependency or empty string
        />
        <AddDependencydialogbox  isOpen={isDialogOpen}onClose={closeDialog} onSubmit={handleDependencySubmit} />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className='bg-gray-800'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-red-500'>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-300'>
              This action cannot be undone. This will permanently delete the selected dependency <b>{dependencyToDelete}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog} className='bg-purple-600 hover:bg-purple-700'>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDependency} className='bg-red-500 hover:bg-red-600'>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        {activeTab === 'terminal' && (
          <div>
            <p className="text-gray-300">Terminal content goes here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for detail rows
const DetailRow = ({
  label,
  value,
  linkText,
  infoIcon,
  dropdownIcon,
  toggle,
  dotIcon,
  updateButton,
  onUpdate,
  onDelete
}: {
  label: string;
  value: string;
  linkText?: string;
  infoIcon?: boolean;
  dropdownIcon?: boolean;
  toggle?: boolean;
  dotIcon?: boolean;
  updateButton?: boolean;
  onUpdate?: () => void;
  onDelete?: () => void;
}) => (
  <div className="flex space-y-4 justify-between items-center bg-gray-800 p-4">
    <span className="text-gray-400">{label}</span>
    <div className="flex items-center space-x-3">
      <span className="text-gray-300 flex flex-1 items-center">{value}</span>
      {linkText && (
        <Link href="#" className="text-purple-400 hover:underline">
          {linkText}
        </Link>
      )}
      {infoIcon && <Info className="w-4 h-4 text-gray-400" />}
      {dropdownIcon && <ChevronDown className="w-4 h-4 text-gray-400" />}
      {toggle && (
        <div className="w-10 h-6 bg-gray-700 rounded-full flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-400 ml-1"></div>
        </div>
      )}
      {dotIcon && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}

      {updateButton && onUpdate && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className='bg-purple-600 hover:bg-purple-700'>Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-10 bg-gray-800">
            <DropdownMenuItem onClick={onUpdate} className='text-purple-400 '>
              Update

            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onDelete} className='text-red-500'>
              Delete

            </DropdownMenuItem>
            {/* Add more dropdown items as needed */}
          </DropdownMenuContent>
          
        </DropdownMenu>
      )}
    </div>
  </div>
);

