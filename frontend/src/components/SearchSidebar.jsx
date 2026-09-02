import React, { useState, useEffect } from 'react';
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts';
import { useQuery } from '@tanstack/react-query';
import styles from '../styles/SearchSidebar.module.css';
import { FaSearch } from "react-icons/fa";
import { searchUsers } from '../api/user';
import Spinner from './Spinner'
import ProfileImage from '../assets/jack.png'
import { Link, useNavigate } from 'react-router-dom'

const SearchSidebar = ({ onClose }) => {
  // const [searchValue, setSearchValue] = useState('');
  const [showRecent, setShowRecent] = useState(true);
  const navigate = useNavigate('')
  const [localRecent, setLocalRecent] = useState(null)
  const [searchResults, setSearchResults]=useState([])
  const [isLoading,setIsLoading]=useState(false)
  const [isError,setIsError]=useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue]=useDebounceValue(searchValue,300)

  useEffect(() => {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || []
    setLocalRecent(recentSearches)
  }, [])

   useEffect(() => {
    const getSearchResults = async () => {
      try {
        setIsLoading(true)
        const res=await searchUsers(debouncedSearchValue)
        console.log('hey\n')
        setSearchResults(res)
      } catch (error) {
        setIsError(true)
        const message = error?.response?.data?.message || error?.message ||
          "Some error occured in fetching results"
        console.error("Error fetching results: ", message)
      } finally{
        setIsLoading(false)
      }
    }
    if(debouncedSearchValue.length>=2){
      setIsError(false)
      getSearchResults()
    }
  }, [debouncedSearchValue]) 

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.length >= 2) {
      setShowRecent(false);
    } else {
      setShowRecent(true);
    }
  };

  const handleUserProfileRedirect = async (name, avatar, _id,collegeName) => {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || []
    if (!recentSearches.find(searchUser => searchUser._id === _id)) {
      recentSearches.push({
        _id,
        name,
        avatar,
        collegeName
      })
    }
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches))

    onClose?.(); // safely call onClose if it's provided
    navigate(`/profile/${name}/posts`)
  }

  const removeRecentSearch = (_id) => {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || []
    recentSearches = recentSearches.filter(searchUser => searchUser._id !== _id)
    // console.log(recentSearches.map(({_id}) => {return _id}) )
    // console.log(_id)
    setLocalRecent(recentSearches)
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches))
  }

  return (
    <div className={styles.searchSidebar}>
      <div className={styles.searchHeader}>
        <h3>Search</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
      <div className={styles.searchContent}>
        <div className={styles.searchBar}>
          <FaSearch size={22} />
          <input
            type="text"
            placeholder='Search a user'
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>

        {isLoading && <div className={styles.loading}><Spinner /></div>}
        {(isError && searchValue.length >= 2) && <div className={styles.error}>Error searching users</div>}

        {!showRecent ? (
          <>
            {searchResults?.users?.length > 0 ? (
              searchResults.users.map(user => {
                return (
                  <div key={user._id} className={styles.searchItem}>
                    <div className={styles.searchAvatar}>
                      <img onClick={() => handleUserProfileRedirect(user.name, user.avatar, user._id, user.collegeId?.name)} src={user.avatar || ProfileImage} alt={user.name} />
                    </div>
                    <div className={styles.searchDetails}>
                      <p onClick={() => handleUserProfileRedirect(user.name, user.avatar, user._id, user.collegeId?.name)} className={styles.searchMessage}>{user.name}</p>
                      <div className={styles.searchUserBio}>
                        {
                          (
                            <span className={styles.bioText}>{user.bio ||
                              `User from ${user.collegeId?.name.length > 12 ?
                                user.collegeId?.name.slice(0, 10) + '...' :
                                user.collegeId?.name}`}</span>
                          )
                        }
                      </div>
                    </div>
                  </div>
                )
              }
              )
            ) : (
              <div className={styles.noResults}>No users found {isLoading && <Spinner />}</div>
            )}
          </>
        ) : (
          <>
            <div className={styles.recentHeader}>Recent</div>
            {/* Render recent searches here */}
            {/* You might want to store these in localStorage */}
            {
              localRecent?.map(user => {
                return (
                  <div key={user._id} className={styles.searchItem}>
                    <div className={styles.searchAvatar}>
                      <img onClick={() => handleUserProfileRedirect(user.name, user.avatar, user._id, (user.collegeId?.name||user.collegeName))} src={user.avatar || ProfileImage} alt={user.name} />
                    </div>
                    <div className={styles.searchDetails}>
                      <p onClick={() => handleUserProfileRedirect(user.name, user.avatar, user._id, (user.collegeId?.name||user.collegeName))} className={styles.searchMessage}>{user.name}</p>
                      <div className={styles.searchUserBio}>
                        {
                          (
                            <span className={styles.bioText}>{user.bio ||
                              `User from ${(user.collegeId?.name || user.collegeName).length > 12 ?
                                (user.collegeId?.name || user.collegeName).slice(0, 10) + '...' :
                                (user.collegeId?.name || user.collegeName)}`}</span>
                          )
                        }
                      </div>
                    </div>
                    <div className={styles.removeSearchedUser} onClick={()=>removeRecentSearch(user._id)}>
                      x
                    </div>
                  </div>
                )
              })
            }
          </>
        )}
      </div>
    </div>
  );
};

export default SearchSidebar;