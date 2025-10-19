import assets from "@/shared/assets";

interface SearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export const SearchInput = ({value, onChange, placeholder = "Search..."}: SearchInputProps) => (
    <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
        <img src={assets.search_icon} alt='search' className='w-3'/>
        <input
            value={value}
            onChange={onChange}
            type="text"
            className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1'
            placeholder={placeholder}
        />
    </div>
);