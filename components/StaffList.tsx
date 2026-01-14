import React from 'react';
import { Staff } from '../types';

interface StaffListProps {
  staff?: Staff[];
  onStaffClick: (staff: Staff) => void;
}

const StaffList: React.FC<StaffListProps> = ({ staff, onStaffClick }) => {
  if (!staff || staff.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-primary mb-4">Meet the Team</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {staff.map((member) => (
          <div 
            key={member.id} 
            onClick={() => onStaffClick(member)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden"
          >
            <div className="relative w-20 h-20 mx-auto mb-3">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover rounded-full border-2 border-gray-100 group-hover:border-secondary transition-colors"
                onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`;
                }}
              />
              {/* Experience Badge */}
              <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                {member.experience}
              </div>

              {/* Live Status Indicator */}
              <div 
                className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    member.status === 'available' ? 'bg-green-500' :
                    member.status === 'busy' ? 'bg-red-500' :
                    member.status === 'break' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}
                title={member.status}
              />
            </div>

            <h3 className="font-bold text-gray-900 text-sm truncate">{member.name}</h3>
            
            {/* Live Status Text */}
            <div className={`text-xs font-bold mb-2 ${
                member.status === 'available' ? 'text-green-600' :
                member.status === 'busy' ? 'text-red-500' :
                member.status === 'break' ? 'text-yellow-600' : 'text-gray-400'
            }`}>
               {member.status === 'available' ? 'Available Now' : 
                member.status === 'busy' ? `Busy (${member.nextAvailableTime})` : 
                member.status === 'break' ? `Break (${member.nextAvailableTime})` : 'Off Duty'}
            </div>
            
            {/* Quick Specialties Preview */}
            <div className="flex flex-wrap justify-center gap-1">
                {member.specialties.slice(0, 2).map((s, i) => (
                    <span key={i} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-100">
                        {s}
                    </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffList;